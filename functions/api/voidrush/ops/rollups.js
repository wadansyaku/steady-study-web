import { handleOpsRollupsGet } from '../_service.js';

export async function onRequestGet(context) {
  return handleOpsRollupsGet(context);
}
