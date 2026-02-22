import { handleMutation, mutationBattlePassExp } from '../../_service.js';

export async function onRequestPost(context) {
  return handleMutation(context, 'battlepass_exp', mutationBattlePassExp);
}
