function sanitizeText(value, maxLen = 200) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
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
