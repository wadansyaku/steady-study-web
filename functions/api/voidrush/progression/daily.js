import { handleDailyGet } from '../_service.js';

export async function onRequestGet(context) {
  return handleDailyGet(context);
}
