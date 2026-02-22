const DEFAULT_ALLOWED_HEADERS = [
  'content-type',
  'x-player-id',
  'x-session-id',
  'x-request-id',
  'x-ops-token',
  'authorization',
].join(', ');

function buildCorsHeaders(request, env) {
  const requestOrigin = request.headers.get('origin') || '';
  const allowlistText = String(env?.VOIDRUSH_CORS_ALLOWLIST || '').trim();

  let allowOrigin = '*';
  if (allowlistText) {
    const allowlist = allowlistText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (requestOrigin && allowlist.includes(requestOrigin)) {
      allowOrigin = requestOrigin;
    } else {
      allowOrigin = allowlist[0] || '*';
    }
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': DEFAULT_ALLOWED_HEADERS,
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function shouldHandleVoidRush(pathname = '') {
  return pathname.startsWith('/api/voidrush');
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const { pathname } = new URL(request.url);

  if (!shouldHandleVoidRush(pathname)) {
    return next();
  }

  const corsHeaders = buildCorsHeaders(request, env);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const response = await next();
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
