import { handleLeaderboardGet } from '../_service.js';

export async function onRequestGet(context) {
  return handleLeaderboardGet(context);
}
