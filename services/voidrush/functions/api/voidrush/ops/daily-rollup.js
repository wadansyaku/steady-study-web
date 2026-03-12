import { handleOpsDailyRollup } from '../_service.js';

export async function onRequestGet(context) {
  return handleOpsDailyRollup(context);
}

export async function onRequestPost(context) {
  return handleOpsDailyRollup(context);
}
