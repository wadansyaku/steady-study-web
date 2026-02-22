import { handleSnapshotGet, handleSnapshotPost } from '../_service.js';

export async function onRequestGet(context) {
  return handleSnapshotGet(context);
}

export async function onRequestPost(context) {
  return handleSnapshotPost(context);
}
