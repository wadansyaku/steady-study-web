import { json } from './_util.js';

export async function onRequestGet() {
  return json({
    ok: true,
    epochMs: Date.now(),
    iso: new Date().toISOString(),
  });
}
