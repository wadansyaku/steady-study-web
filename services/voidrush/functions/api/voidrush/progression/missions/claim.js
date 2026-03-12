import { handleMutation, mutationMissionClaim } from '../../_service.js';

export async function onRequestPost(context) {
  return handleMutation(context, 'mission_claim', mutationMissionClaim);
}
