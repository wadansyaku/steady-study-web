const AUTH_TOKEN_VERSION = 1;
const DEFAULT_TOKEN_TTL_SEC = 14 * 24 * 60 * 60;
const MAX_TOKEN_TTL_SEC = 90 * 24 * 60 * 60;
const MIN_TOKEN_TTL_SEC = 60;
const CLOCK_SKEW_SEC = 120;

function textEncode(value) {
  return new TextEncoder().encode(String(value ?? ''));
}

function textDecode(bytes) {
  return new TextDecoder().decode(bytes);
}

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
    + '==='.slice((input.length + 3) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

function sanitizeOpaqueId(raw, prefix = 'id') {
  const text = String(raw || '').trim();
  if (!text) return '';
  const maxLen = 128;
  const safe = text.slice(0, maxLen);
  const pattern = new RegExp(`^${prefix}_[A-Za-z0-9._-]{8,}$`);
  return pattern.test(safe) ? safe : '';
}

function getAuthSecret(env) {
  const secret = String(env?.VOIDRUSH_AUTH_SECRET || '').trim();
  return secret || '';
}

export function authConfigured(env) {
  return Boolean(getAuthSecret(env));
}

export function readBearerToken(request) {
  const raw = String(request.headers.get('authorization') || '').trim();
  if (!raw) return '';
  const match = raw.match(/^Bearer\s+(.+)$/i);
  return match ? String(match[1] || '').trim() : '';
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    textEncode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function signPayload(secret, payloadText) {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, textEncode(payloadText));
  return new Uint8Array(signature);
}

export function createOpaqueId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  const rand = Math.random().toString(36).slice(2, 12);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export async function sha256Hex(input) {
  const digest = await crypto.subtle.digest('SHA-256', textEncode(input));
  const bytes = new Uint8Array(digest);
  return Array.from(bytes).map((n) => n.toString(16).padStart(2, '0')).join('');
}

export async function issueAuthToken(env, {
  playerId,
  sessionId,
  ttlSec = DEFAULT_TOKEN_TTL_SEC,
} = {}) {
  const secret = getAuthSecret(env);
  if (!secret) {
    return { ok: false, reason: 'auth_secret_missing' };
  }

  const safePlayerId = sanitizeOpaqueId(playerId, 'player');
  const safeSessionId = sanitizeOpaqueId(sessionId, 'session');
  if (!safePlayerId || !safeSessionId) {
    return { ok: false, reason: 'invalid_identity' };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const safeTtl = Math.max(MIN_TOKEN_TTL_SEC, Math.min(MAX_TOKEN_TTL_SEC, Number(ttlSec) || DEFAULT_TOKEN_TTL_SEC));
  const payload = {
    v: AUTH_TOKEN_VERSION,
    playerId: safePlayerId,
    sessionId: safeSessionId,
    iat: nowSec,
    exp: nowSec + safeTtl,
  };

  const payloadB64 = toBase64Url(textEncode(JSON.stringify(payload)));
  const signatureBytes = await signPayload(secret, payloadB64);
  const signatureB64 = toBase64Url(signatureBytes);
  const token = `${payloadB64}.${signatureB64}`;

  return {
    ok: true,
    token,
    payload,
    issuedAt: new Date(nowSec * 1000).toISOString(),
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

export async function verifyAuthToken(env, token) {
  const secret = getAuthSecret(env);
  if (!secret) {
    return { ok: false, reason: 'auth_secret_missing' };
  }

  const raw = String(token || '').trim();
  if (!raw) {
    return { ok: false, reason: 'missing_token' };
  }

  const [payloadB64, signatureB64] = raw.split('.');
  if (!payloadB64 || !signatureB64) {
    return { ok: false, reason: 'malformed_token' };
  }

  let payload;
  try {
    payload = JSON.parse(textDecode(fromBase64Url(payloadB64)));
  } catch {
    return { ok: false, reason: 'invalid_payload' };
  }

  const safePlayerId = sanitizeOpaqueId(payload?.playerId, 'player');
  const safeSessionId = sanitizeOpaqueId(payload?.sessionId, 'session');
  const iat = Number(payload?.iat || 0);
  const exp = Number(payload?.exp || 0);
  const nowSec = Math.floor(Date.now() / 1000);

  if (!safePlayerId || !safeSessionId || !Number.isFinite(iat) || !Number.isFinite(exp) || exp <= iat) {
    return { ok: false, reason: 'invalid_claims' };
  }

  if (iat > nowSec + CLOCK_SKEW_SEC) {
    return { ok: false, reason: 'token_not_yet_valid' };
  }
  if (exp <= nowSec - CLOCK_SKEW_SEC) {
    return { ok: false, reason: 'token_expired' };
  }

  const expectedSig = await signPayload(secret, payloadB64);
  let actualSig;
  try {
    actualSig = fromBase64Url(signatureB64);
  } catch {
    return { ok: false, reason: 'invalid_signature_encoding' };
  }

  if (expectedSig.length !== actualSig.length) {
    return { ok: false, reason: 'signature_mismatch' };
  }
  let diff = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    diff |= expectedSig[i] ^ actualSig[i];
  }
  if (diff !== 0) {
    return { ok: false, reason: 'signature_mismatch' };
  }

  return {
    ok: true,
    payload: {
      v: AUTH_TOKEN_VERSION,
      playerId: safePlayerId,
      sessionId: safeSessionId,
      iat,
      exp,
    },
  };
}
