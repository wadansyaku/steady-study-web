const DEFAULT_ALLOWED_HEADERS = [
  'content-type',
  'x-player-id',
  'x-session-id',
  'x-voidrush-proof',
  'x-request-id',
  'x-ops-token',
  'authorization',
].join(', ');

const DEFAULT_ORIGIN_ALLOWLIST = [
  'https://ai-yu-me.com',
  'https://www.ai-yu-me.com',
  'https://aiyume-web.pages.dev',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function parseAllowlist(env) {
  const allowlistText = String(env?.VOIDRUSH_CORS_ALLOWLIST || '').trim();
  if (!allowlistText) return [...DEFAULT_ORIGIN_ALLOWLIST];
  const allowlist = allowlistText
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return allowlist.length > 0 ? allowlist : [...DEFAULT_ORIGIN_ALLOWLIST];
}

function buildCorsHeaders(request, env) {
  const requestOrigin = request.headers.get('origin') || '';
  const allowlist = parseAllowlist(env);
  const fallbackOrigin = allowlist[0] || 'https://ai-yu-me.com';
  const allowOrigin = requestOrigin && allowlist.includes(requestOrigin)
    ? requestOrigin
    : fallbackOrigin;

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
