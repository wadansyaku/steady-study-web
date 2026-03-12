function sanitizeText(value, maxLen = 200) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

export function sanitizeDateKey(value) {
  const text = sanitizeText(value, 16);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function errorJson(code, message, status = 400, extra = {}) {
  return json({
    ok: false,
    error: code,
    message,
    ...extra,
  }, status);
}

export async function safeReadJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function toDateKey(epochMs = Date.now()) {
  const d = new Date(epochMs);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function dateKeyOffset(baseKey, offsetDays) {
  const safe = sanitizeDateKey(baseKey);
  if (!safe) return '';
  const date = new Date(`${safe}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return '';
  date.setUTCDate(date.getUTCDate() + Number(offsetDays || 0));
  return toDateKey(date.getTime());
}

export function nowIso() {
  return new Date().toISOString();
}

export function getPlayerId(request) {
  const raw = request.headers.get('x-player-id');
  const playerId = sanitizeText(raw, 128);
  if (!playerId) return null;
  return playerId;
}

export function getSessionId(request) {
  return sanitizeText(request.headers.get('x-session-id'), 128);
}

function getBearerToken(request) {
  const raw = sanitizeText(request.headers.get('authorization'), 512);
  if (!raw) return '';
  const match = raw.match(/^Bearer\s+(.+)$/i);
  return match ? sanitizeText(match[1], 256) : '';
}

export function getOpsToken(request) {
  const fromHeader = sanitizeText(request.headers.get('x-ops-token'), 256);
  if (fromHeader) return fromHeader;
  return getBearerToken(request);
}

export function isOpsAuthorized(request, env) {
  const expected = sanitizeText(env?.VOIDRUSH_OPS_TOKEN || '', 256);
  if (!expected) return false;
  const received = getOpsToken(request);
  return Boolean(received) && received === expected;
}

export async function readEnvelope(request) {
  const body = await safeReadJson(request);
  const requestId = sanitizeText(body?.requestId || request.headers.get('x-request-id') || '', 128);
  const clientSentAt = sanitizeText(body?.clientSentAt || '', 64);
  const payload = body && typeof body.payload === 'object' && body.payload !== null ? body.payload : {};

  return {
    body,
    requestId,
    clientSentAt,
    payload,
  };
}

export function envelopeOk(path, body = null, extra = {}) {
  return {
    ok: true,
    accepted: true,
    path,
    receivedAt: nowIso(),
    body,
    ...extra,
  };
}

export function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function clampInt(value, min, max) {
  return Math.round(clamp(value, min, max));
}
