import { dbAvailable } from './_db.js';
import { json, toDateKey } from './_util.js';

export async function onRequestGet(context) {
  return json({
    ok: true,
    epochMs: Date.now(),
    iso: new Date().toISOString(),
    serverDate: toDateKey(),
    dbAvailable: dbAvailable(context.env),
  });
}
