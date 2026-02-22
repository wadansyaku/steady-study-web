import { envelopeOk, json, safeReadJson } from '../_util.js';

export async function onRequestPost(context) {
  const payload = await safeReadJson(context.request);
  const path = new URL(context.request.url).pathname;
  return json(envelopeOk(path, payload?.payload || null));
}
