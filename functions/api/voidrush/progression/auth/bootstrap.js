import { handleAuthBootstrap } from '../../_service.js';

export async function onRequestPost(context) {
  return handleAuthBootstrap(context);
}
