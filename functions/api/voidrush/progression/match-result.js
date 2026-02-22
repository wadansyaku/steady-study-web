import { handleMutation, mutationMatchResult } from '../_service.js';

export async function onRequestPost(context) {
  return handleMutation(context, 'match_result', mutationMatchResult);
}
