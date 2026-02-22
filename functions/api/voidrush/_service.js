import {
  dbAvailable,
  fetchLeaderboard,
  getRequestReplay,
  insertMatchEvent,
  loadPlayerState,
  savePlayerState,
  saveRequestReplay,
} from './_db.js';
import {
  addBattlePassExp,
  applyMatchResult,
  claimBattlePassReward,
  claimLoginBonus,
  claimMissionReward,
  compactSnapshot,
  ensureDailyMissions,
  feedMatchIntoMissions,
  sanitizeStateSnapshot,
} from './_state.js';
import {
  errorJson,
  getPlayerId,
  json,
  readEnvelope,
  toDateKey,
} from './_util.js';

function pathOf(request) {
  return new URL(request.url).pathname;
}

function buildResponseBase({
  eventType,
  requestId,
  dayKey,
  snapshot,
  hasProfile,
  dbOk,
  result,
}) {
  return {
    ok: true,
    accepted: true,
    eventType,
    requestId: requestId || null,
    serverDate: dayKey,
    hasProfile,
    dbAvailable: dbOk,
    result: result || null,
    snapshot: snapshot ? compactSnapshot(snapshot) : null,
  };
}

async function maybeReturnReplay(env, playerId, requestId) {
    if (!requestId) return null;
    const replay = await getRequestReplay(env, playerId, requestId);
    return replay || null;
}

async function maybeSaveReplay(env, playerId, requestId, requestPath, eventType, payload, response) {
  if (!requestId) return;
  await saveRequestReplay(env, playerId, requestId, requestPath, eventType, payload, response);
}

function ensurePlayer(request) {
  const playerId = getPlayerId(request);
  if (!playerId) {
    return {
      error: errorJson('missing_player_id', 'x-player-id header is required', 401),
      playerId: null,
    };
  }
  return { error: null, playerId };
}

export async function handleSnapshotGet(context) {
  const { request, env } = context;
  const { error, playerId } = ensurePlayer(request);
  if (error) return error;

  const dayKey = toDateKey();
  const loaded = await loadPlayerState(env, playerId);
  const state = loaded.state;

  let changed = false;
  if (loaded.exists) {
    changed = ensureDailyMissions(state, playerId, dayKey);
    if (changed) {
      await savePlayerState(env, playerId, state);
    }
  }

  return json({
    ok: true,
    hasProfile: loaded.exists,
    dbAvailable: loaded.dbAvailable,
    serverDate: dayKey,
    snapshot: loaded.exists ? compactSnapshot(state) : null,
    changed,
  });
}

export async function handleSnapshotPost(context) {
  const { request, env } = context;
  const { error, playerId } = ensurePlayer(request);
  if (error) return error;

  const requestPath = pathOf(request);
  const { payload, requestId } = await readEnvelope(request);

  const replay = await maybeReturnReplay(env, playerId, requestId);
  if (replay) {
    const latest = await loadPlayerState(env, playerId);
    if (latest.exists) {
      replay.snapshot = compactSnapshot(latest.state);
      replay.replayed = true;
    }
    return json(replay);
  }

  const dayKey = toDateKey();
  const snapshot = sanitizeStateSnapshot(payload.snapshot || payload.state || payload || {});
  ensureDailyMissions(snapshot, playerId, dayKey);

  const save = await savePlayerState(env, playerId, snapshot);
  if (!save.ok) {
    return errorJson('db_unavailable', 'VOIDRUSH_DB binding is not configured', 500);
  }

  const response = buildResponseBase({
    eventType: 'snapshot_upload',
    requestId,
    dayKey,
    snapshot: save.state,
    hasProfile: true,
    dbOk: dbAvailable(env),
    result: { reason: payload.reason || 'manual' },
  });

  await maybeSaveReplay(env, playerId, requestId, requestPath, 'snapshot_upload', payload, response);
  return json(response);
}

export async function handleDailyGet(context) {
  const { request, env } = context;
  const { error, playerId } = ensurePlayer(request);
  if (error) return error;

  const dayKey = toDateKey();
  const loaded = await loadPlayerState(env, playerId);

  if (!loaded.exists) {
    return json({
      ok: true,
      hasProfile: false,
      dbAvailable: loaded.dbAvailable,
      serverDate: dayKey,
      missions: [],
    });
  }

  const state = loaded.state;
  const changed = ensureDailyMissions(state, playerId, dayKey);
  if (changed) {
    await savePlayerState(env, playerId, state);
  }

  return json({
    ok: true,
    hasProfile: true,
    dbAvailable: loaded.dbAvailable,
    serverDate: dayKey,
    missions: state.missions.daily,
  });
}

export async function handleMutation(context, eventType, mutationFn) {
  const { request, env } = context;
  const { error, playerId } = ensurePlayer(request);
  if (error) return error;

  const requestPath = pathOf(request);
  const envelope = await readEnvelope(request);
  const { payload, requestId } = envelope;
  const dayKey = toDateKey();

  const replay = await maybeReturnReplay(env, playerId, requestId);
  if (replay) {
    const latest = await loadPlayerState(env, playerId);
    if (latest.exists) {
      replay.snapshot = compactSnapshot(latest.state);
      replay.replayed = true;
      replay.serverDate = dayKey;
    }
    return json(replay);
  }

  const loaded = await loadPlayerState(env, playerId);
  const state = loaded.state;

  ensureDailyMissions(state, playerId, dayKey);

  const mutation = await mutationFn({
    env,
    playerId,
    payload,
    dayKey,
    state,
    loaded,
  });

  if (!mutation?.ok) {
    return errorJson(
      mutation?.reason || 'mutation_failed',
      mutation?.message || 'The requested operation failed',
      mutation?.status || 400,
      { detail: mutation?.detail || null },
    );
  }

  const save = await savePlayerState(env, playerId, state);
  if (!save.ok) {
    return errorJson('db_unavailable', 'VOIDRUSH_DB binding is not configured', 500);
  }

  const response = buildResponseBase({
    eventType,
    requestId,
    dayKey,
    snapshot: save.state,
    hasProfile: true,
    dbOk: dbAvailable(env),
    result: mutation.result || null,
  });

  await maybeSaveReplay(env, playerId, requestId, requestPath, eventType, payload, response);
  return json(response);
}

export async function mutationMatchResult({ env, playerId, payload, dayKey, state }) {
  const matchData = payload.matchData || {};
  const result = applyMatchResult(state, matchData);
  feedMatchIntoMissions(state, playerId, dayKey, matchData);
  await insertMatchEvent(env, playerId, result);
  return { ok: true, result };
}

export async function mutationBattlePassExp({ payload, state }) {
  const amount = payload.amount ?? 0;
  const meta = payload.meta || {};
  const result = addBattlePassExp(state, amount, 'match_clear', meta);
  return { ok: true, result };
}

export async function mutationMissionClaim({ payload, state, playerId, dayKey }) {
  const missionId = String(payload.missionId || '');
  if (!missionId) {
    return { ok: false, reason: 'mission_id_required' };
  }

  const result = claimMissionReward(state, playerId, dayKey, missionId);
  if (!result.ok) return result;
  return { ok: true, result };
}

export async function mutationLoginBonusClaim({ state, dayKey }) {
  const result = claimLoginBonus(state, dayKey);
  if (!result.ok) return result;
  return { ok: true, result };
}

export async function mutationBattlePassClaim({ payload, state }) {
  const result = claimBattlePassReward(state, payload.level);
  if (!result.ok) return result;
  return { ok: true, result };
}

export async function mutationGachaPull({ payload }) {
  return {
    ok: true,
    result: {
      recorded: true,
      mode: payload.mode || 'unknown',
      pulls: Array.isArray(payload.pulls) ? payload.pulls.length : 0,
    },
  };
}

export async function handleLeaderboardGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') || 20);
  const rows = await fetchLeaderboard(env, limit);

  return json({
    ok: true,
    season: 'S0',
    rows,
  });
}
