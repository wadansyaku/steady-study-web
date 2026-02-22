import { handleOpsAnomaliesGet } from '../_service.js';

export async function onRequestGet(context) {
  return handleOpsAnomaliesGet(context);
}
