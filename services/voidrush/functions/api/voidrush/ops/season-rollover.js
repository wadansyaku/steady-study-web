import { handleOpsSeasonRollover } from '../_service.js';

export async function onRequestPost(context) {
  return handleOpsSeasonRollover(context);
}
