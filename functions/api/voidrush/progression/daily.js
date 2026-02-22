import { json } from '../_util.js';

export async function onRequestGet() {
  return json({
    ok: true,
    serverDate: new Date().toISOString().slice(0, 10),
    mode: 'stub',
  });
}
