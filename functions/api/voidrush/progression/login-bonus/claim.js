import { handleMutation, mutationLoginBonusClaim } from '../../_service.js';

export async function onRequestPost(context) {
  return handleMutation(context, 'login_bonus_claim', mutationLoginBonusClaim);
}
