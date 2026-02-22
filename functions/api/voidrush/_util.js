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

export async function safeReadJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function envelopeOk(path, body = null) {
  return {
    ok: true,
    accepted: true,
    path,
    receivedAt: new Date().toISOString(),
    body,
  };
}
