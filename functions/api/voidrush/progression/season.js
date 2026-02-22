import { handleSeasonGet } from '../_service.js';

export async function onRequestGet(context) {
  return handleSeasonGet(context);
}
