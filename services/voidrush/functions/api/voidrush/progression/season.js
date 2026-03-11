import { handleSeasonGet } from '../_service.js';

export async function onRequestGet(context) {
  return handleSeasonGet(context);
}

export async function onRequestHead(context) {
  const response = await onRequestGet(context);
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
