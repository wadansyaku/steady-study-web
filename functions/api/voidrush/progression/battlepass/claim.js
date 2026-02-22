import { handleMutation, mutationBattlePassClaim } from '../../_service.js';

export async function onRequestPost(context) {
  return handleMutation(context, 'battlepass_claim', mutationBattlePassClaim);
}
