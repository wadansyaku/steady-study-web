import { handleMutation, mutationGachaPull } from '../../_service.js';

export async function onRequestPost(context) {
  return handleMutation(context, 'gacha_pull', mutationGachaPull);
}
