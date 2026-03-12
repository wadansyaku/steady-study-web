import { analyticsAvailable, writeAnalyticsPoint } from './_analytics.js';
import {
  archiveSeason,
  consumeRateLimit,
  dbAvailable,
  ensureAuthIdentity,
  ensureSeason,
  fetchAnomalyEvents,
  fetchDailyRollups,
  fetchLeaderboard,
  fetchSeasonArchive,
  getRequestReplay,
  insertMatchEvent,
  listSeasons,
  loadPlayerState,
  runDailyRollup,
  saveAnomalyEvents,
  savePlayerState,
  saveRequestReplay,
  setSeasonActive,
} from './_db.js';
import {
  authConfigured,
  issueAuthToken,
  readBearerToken,
  sha256Hex,
  verifyAuthToken,
} from './_auth.js';
import {
  addBattlePassExp,
  applyGachaPull,
  applyMatchResult,
  claimBattlePassReward,
  claimLoginBonus,
  claimMissionReward,
  compactSnapshot,
  ensureDailyMissions,
  feedMatchIntoMissions,
  sanitizeStateSnapshot,
} from './_state.js';
import { detectAnomalies, summarizeAnomalies } from './_security.js';
import {
  dateKeyOffset,
  errorJson,
  getPlayerId,
  getSessionId,
  isOpsAuthorized,
  json,
  readEnvelope,
  sanitizeDateKey,
  toDateKey,
} from './_util.js';

const AUTH_BOOTSTRAP_IP_LIMIT_PER_MIN = 40;
const AUTH_BOOTSTRAP_PLAYER_LIMIT_PER_5MIN = 15;
const PROGRESSION_LIMIT_PER_MIN = 180;
const SECURITY_BLOCK_CRITICAL_SCORE = 90;

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
  season,
  security,
}) {
  return {
    ok: true,
    accepted: true,
    eventType,
    requestId: requestId || null,
    serverDate: dayKey,
    hasProfile,
    dbAvailable: dbOk,
    season: season
      ? {
        id: season.seasonId,
        label: season.label,
        startsOn: season.startsOn,
        endsOn: season.endsOn,
        status: season.status,
      }
      : null,
    security: security || {
      flagged: false,
      count: 0,
      highestSeverity: 'none',
      highestScore: 0,
    },
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

function toSafeInt(value, fallback, min = 1, max = 100000) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  return Math.max(min, Math.min(max, rounded));
}

function readLimitFromEnv(env, key, fallback, min = 1, max = 100000) {
  return toSafeInt(env?.[key], fallback, min, max);
}

function isValidOpaqueId(value, prefix) {
  const safe = String(value || '').trim().slice(0, 128);
  if (!safe) return false;
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}_[A-Za-z0-9._-]{8,}$`).test(safe);
}

function readPlayerProof(request, payload = {}) {
  const fromHeader = String(
    request.headers.get('x-voidrush-proof')
    || request.headers.get('x-player-proof')
    || ''
  ).trim();
  const fromPayload = String(
    payload?.playerProof
    || payload?.proof
    || ''
  ).trim();
  const raw = (fromHeader || fromPayload).slice(0, 256);
  return /^[A-Za-z0-9._-]{16,256}$/.test(raw) ? raw : '';
}

function resolveClientAddress(request) {
  const cf = String(request.headers.get('cf-connecting-ip') || '').trim();
  if (cf) return cf.slice(0, 96);
  const forwarded = String(request.headers.get('x-forwarded-for') || '').trim();
  if (!forwarded) return 'unknown';
  const first = forwarded.split(',')[0].trim();
  return first ? first.slice(0, 96) : 'unknown';
}

function shouldBlockForSecurity(flags = []) {
  if (!Array.isArray(flags) || flags.length === 0) {
    return { blocked: false, reason: 'none' };
  }

  for (const flag of flags) {
    const severity = String(flag?.severity || 'warn');
    const score = Number(flag?.score || 0);
    if (severity === 'critical' && score >= SECURITY_BLOCK_CRITICAL_SCORE) {
      return {
        blocked: true,
        reason: String(flag?.ruleId || 'critical_anomaly'),
      };
    }
  }

  return { blocked: false, reason: 'none' };
}

function rateLimitResponse(result, scope) {
  return json({
    ok: false,
    error: 'rate_limited',
    message: 'Too many requests',
    scope,
    limit: result.limit,
    count: result.count,
    retryAfterSec: result.retryAfterSec,
  }, 429, {
    'retry-after': String(result.retryAfterSec || 1),
  });
}

async function requireRateLimit(env, {
  scope,
  identifier,
  limit,
  windowSec,
}) {
  const result = await consumeRateLimit(env, {
    scope,
    identifier,
    limit,
    windowSec,
  });
  if (!result.ok) {
    return rateLimitResponse(result, scope);
  }
  return null;
}

async function requirePlayerAuth(context, {
  rateLimitScope = 'progression_player',
  rateLimitLimit = PROGRESSION_LIMIT_PER_MIN,
  rateLimitWindowSec = 60,
} = {}) {
  const { request, env } = context;

  if (!authConfigured(env)) {
    return {
      error: errorJson('auth_not_configured', 'VOIDRUSH_AUTH_SECRET is not configured', 503),
      playerId: null,
      sessionId: null,
    };
  }

  const token = readBearerToken(request);
  const verified = await verifyAuthToken(env, token);
  if (!verified.ok) {
    return {
      error: errorJson('unauthorized', 'valid bearer token is required', 401, {
        reason: verified.reason || 'invalid_token',
      }),
      playerId: null,
      sessionId: null,
    };
  }

  const tokenPlayerId = verified.payload.playerId;
  const tokenSessionId = verified.payload.sessionId;
  const headerPlayerId = getPlayerId(request);
  const headerSessionId = getSessionId(request);

  if (headerPlayerId && headerPlayerId !== tokenPlayerId) {
    return {
      error: errorJson('player_id_mismatch', 'x-player-id does not match bearer token', 401),
      playerId: null,
      sessionId: null,
    };
  }
  if (headerSessionId && headerSessionId !== tokenSessionId) {
    return {
      error: errorJson('session_id_mismatch', 'x-session-id does not match bearer token', 401),
      playerId: null,
      sessionId: null,
    };
  }

  const limitError = await requireRateLimit(env, {
    scope: rateLimitScope,
    identifier: tokenPlayerId,
    limit: readLimitFromEnv(env, 'VOIDRUSH_PLAYER_RATE_LIMIT_PER_MIN', rateLimitLimit, 30, 10000),
    windowSec: rateLimitWindowSec,
  });
  if (limitError) {
    return {
      error: limitError,
      playerId: null,
      sessionId: null,
    };
  }

  return {
    error: null,
    playerId: tokenPlayerId,
    sessionId: tokenSessionId,
  };
}

function requireOps(context) {
  const { request, env } = context;
  if (!String(env?.VOIDRUSH_OPS_TOKEN || '').trim()) {
    return errorJson('ops_token_not_configured', 'VOIDRUSH_OPS_TOKEN is not configured', 500);
  }
  if (!isOpsAuthorized(request, env)) {
    return errorJson('ops_unauthorized', 'invalid or missing ops token', 401);
  }
  return null;
}

function trackAnalytics(env, eventName, fields = {}) {
  writeAnalyticsPoint(env, eventName, fields);
}

function parseSeasonId(raw) {
  const value = String(raw || '').trim();
  return /^S\d{6}$/.test(value) ? value : '';
}

export async function handleAuthBootstrap(context) {
  const { request, env } = context;

  if (!authConfigured(env)) {
    return errorJson('auth_not_configured', 'VOIDRUSH_AUTH_SECRET is not configured', 503);
  }

  const envelope = await readEnvelope(request);
  const payload = envelope?.payload || {};
  const playerId = getPlayerId(request);
  const sessionId = getSessionId(request);
  const playerProof = readPlayerProof(request, payload);
  const clientAddress = resolveClientAddress(request);

  const ipLimitError = await requireRateLimit(env, {
    scope: 'auth_bootstrap_ip',
    identifier: clientAddress,
    limit: readLimitFromEnv(env, 'VOIDRUSH_AUTH_BOOTSTRAP_IP_PER_MIN', AUTH_BOOTSTRAP_IP_LIMIT_PER_MIN, 10, 1000),
    windowSec: 60,
  });
  if (ipLimitError) return ipLimitError;

  if (!playerId || !isValidOpaqueId(playerId, 'player')) {
    return errorJson('invalid_player_id', 'valid x-player-id header is required', 401);
  }
  if (!sessionId || !isValidOpaqueId(sessionId, 'session')) {
    return errorJson('invalid_session_id', 'valid x-session-id header is required', 401);
  }
  if (!playerProof) {
    return errorJson('invalid_player_proof', 'x-voidrush-proof header is required', 401);
  }

  const playerLimitError = await requireRateLimit(env, {
    scope: 'auth_bootstrap_player',
    identifier: playerId,
    limit: readLimitFromEnv(env, 'VOIDRUSH_AUTH_BOOTSTRAP_PLAYER_PER_5MIN', AUTH_BOOTSTRAP_PLAYER_LIMIT_PER_5MIN, 5, 200),
    windowSec: 5 * 60,
  });
  if (playerLimitError) return playerLimitError;

  const proofHash = await sha256Hex(`voidrush-proof:v1:${playerId}:${playerProof}`);
  const identity = await ensureAuthIdentity(env, playerId, proofHash);
  if (!identity.ok) {
    const status = identity.reason === 'proof_mismatch' ? 401 : 503;
    return errorJson('auth_identity_verification_failed', 'player proof verification failed', status, {
      reason: identity.reason || 'auth_identity_failed',
    });
  }

  const tokenIssued = await issueAuthToken(env, {
    playerId,
    sessionId,
  });
  if (!tokenIssued.ok) {
    return errorJson('token_issue_failed', 'failed to issue bearer token', 503, {
      reason: tokenIssued.reason || 'issue_failed',
    });
  }

  trackAnalytics(env, 'auth_bootstrap', {
    playerId,
    status: identity.created ? 'created' : 'verified',
    value0: identity.created ? 1 : 0,
    value1: 1,
    dayKey: toDateKey(),
    ruleId: 'proof_v1',
  });

  return json({
    ok: true,
    playerId,
    sessionId,
    token: tokenIssued.token,
    issuedAt: tokenIssued.issuedAt,
    expiresAt: tokenIssued.expiresAt,
    expiresInSec: Math.max(1, Number(tokenIssued.payload?.exp || 0) - Number(tokenIssued.payload?.iat || 0)),
  });
}

export async function handleSnapshotGet(context) {
  const { env } = context;
  const { error, playerId } = await requirePlayerAuth(context);
  if (error) return error;

  const dayKey = toDateKey();
  const season = await ensureSeason(env, dayKey);
  const loaded = await loadPlayerState(env, playerId);
  const state = loaded.state;

  let changed = false;
  if (loaded.exists) {
    changed = ensureDailyMissions(state, playerId, dayKey);
    if (changed) {
      await savePlayerState(env, playerId, state, season.seasonId);
    }
  }

  return json({
    ok: true,
    hasProfile: loaded.exists,
    dbAvailable: loaded.dbAvailable,
    serverDate: dayKey,
    season,
    snapshot: loaded.exists ? compactSnapshot(state) : null,
    changed,
  });
}

export async function handleSnapshotPost(context) {
  const { request, env } = context;
  const { error, playerId } = await requirePlayerAuth(context);
  if (error) return error;

  const requestPath = pathOf(request);
  const { payload, requestId } = await readEnvelope(request);
  const dayKey = toDateKey();
  const season = await ensureSeason(env, dayKey);

  const replay = await maybeReturnReplay(env, playerId, requestId);
  if (replay) {
    const latest = await loadPlayerState(env, playerId);
    if (latest.exists) {
      replay.snapshot = compactSnapshot(latest.state);
      replay.replayed = true;
      replay.season = {
        id: season.seasonId,
        label: season.label,
        startsOn: season.startsOn,
        endsOn: season.endsOn,
        status: season.status,
      };
      replay.serverDate = dayKey;
    }
    return json(replay);
  }

  const loaded = await loadPlayerState(env, playerId);
  const beforeState = loaded.exists
    ? compactSnapshot(loaded.state)
    : sanitizeStateSnapshot({});

  const snapshot = sanitizeStateSnapshot(payload.snapshot || payload.state || payload || {});
  ensureDailyMissions(snapshot, playerId, dayKey);

  const flags = detectAnomalies({
    eventType: 'snapshot_upload',
    payload,
    beforeState,
    afterState: snapshot,
  });

  const security = summarizeAnomalies(flags);
  if (flags.length > 0) {
    await saveAnomalyEvents(env, {
      seasonId: season.seasonId,
      playerId,
      eventType: 'snapshot_upload',
      flags,
    });
  }

  const securityDecision = shouldBlockForSecurity(flags);
  if (securityDecision.blocked) {
    const blockedResponse = {
      ok: false,
      accepted: false,
      error: 'security_blocked',
      message: 'request blocked by anti-cheat policy',
      requestId: requestId || null,
      eventType: 'snapshot_upload',
      serverDate: dayKey,
      season: season?.seasonId || null,
      security,
      ruleId: securityDecision.reason,
    };

    await maybeSaveReplay(env, playerId, requestId, requestPath, 'snapshot_upload', payload, blockedResponse);

    trackAnalytics(env, 'snapshot_upload', {
      seasonId: season.seasonId,
      playerId,
      status: 'blocked',
      value0: security.count,
      value1: security.highestScore,
      dayKey,
      ruleId: securityDecision.reason,
    });

    return json(blockedResponse, 403);
  }

  const save = await savePlayerState(env, playerId, snapshot, season.seasonId);
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
    season,
    security,
    result: { reason: payload.reason || 'manual' },
  });

  await maybeSaveReplay(env, playerId, requestId, requestPath, 'snapshot_upload', payload, response);

  trackAnalytics(env, 'snapshot_upload', {
    seasonId: season.seasonId,
    playerId,
    status: security.flagged ? 'flagged' : 'ok',
    value0: security.count,
    value1: security.highestScore,
    dayKey,
    ruleId: security.highestSeverity,
  });

  return json(response);
}

export async function handleDailyGet(context) {
  const { env } = context;
  const { error, playerId } = await requirePlayerAuth(context);
  if (error) return error;

  const dayKey = toDateKey();
  const season = await ensureSeason(env, dayKey);
  const loaded = await loadPlayerState(env, playerId);

  if (!loaded.exists) {
    return json({
      ok: true,
      hasProfile: false,
      dbAvailable: loaded.dbAvailable,
      serverDate: dayKey,
      season,
      missions: [],
    });
  }

  const state = loaded.state;
  const changed = ensureDailyMissions(state, playerId, dayKey);
  if (changed) {
    await savePlayerState(env, playerId, state, season.seasonId);
  }

  return json({
    ok: true,
    hasProfile: true,
    dbAvailable: loaded.dbAvailable,
    serverDate: dayKey,
    season,
    missions: state.missions.daily,
  });
}

export async function handleMutation(context, eventType, mutationFn) {
  const { request, env } = context;
  const { error, playerId } = await requirePlayerAuth(context);
  if (error) return error;

  const requestPath = pathOf(request);
  const envelope = await readEnvelope(request);
  const { payload, requestId } = envelope;
  const dayKey = toDateKey();
  const season = await ensureSeason(env, dayKey);

  const replay = await maybeReturnReplay(env, playerId, requestId);
  if (replay) {
    const latest = await loadPlayerState(env, playerId);
    if (latest.exists) {
      replay.snapshot = compactSnapshot(latest.state);
      replay.replayed = true;
      replay.serverDate = dayKey;
      replay.season = {
        id: season.seasonId,
        label: season.label,
        startsOn: season.startsOn,
        endsOn: season.endsOn,
        status: season.status,
      };
    }
    return json(replay);
  }

  const loaded = await loadPlayerState(env, playerId);
  const state = loaded.state;
  const beforeState = compactSnapshot(state);

  ensureDailyMissions(state, playerId, dayKey);

  const mutation = await mutationFn({
    env,
    playerId,
    payload,
    dayKey,
    state,
    loaded,
    season,
  });

  if (!mutation?.ok) {
    return errorJson(
      mutation?.reason || 'mutation_failed',
      mutation?.message || 'The requested operation failed',
      mutation?.status || 400,
      { detail: mutation?.detail || null },
    );
  }

  const flags = detectAnomalies({
    eventType,
    payload,
    beforeState,
    afterState: state,
  });

  const security = summarizeAnomalies(flags);
  if (flags.length > 0) {
    await saveAnomalyEvents(env, {
      seasonId: season.seasonId,
      playerId,
      eventType,
      flags,
    });
  }

  const securityDecision = shouldBlockForSecurity(flags);
  if (securityDecision.blocked) {
    const blockedResponse = {
      ok: false,
      accepted: false,
      error: 'security_blocked',
      message: 'request blocked by anti-cheat policy',
      requestId: requestId || null,
      eventType,
      serverDate: dayKey,
      season: season?.seasonId || null,
      security,
      ruleId: securityDecision.reason,
    };

    await maybeSaveReplay(env, playerId, requestId, requestPath, eventType, payload, blockedResponse);

    trackAnalytics(env, eventType, {
      seasonId: season.seasonId,
      playerId,
      status: 'blocked',
      value0: security.count,
      value1: security.highestScore,
      dayKey,
      ruleId: securityDecision.reason,
    });

    return json(blockedResponse, 403);
  }

  const save = await savePlayerState(env, playerId, state, season.seasonId);
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
    season,
    security,
    result: mutation.result || null,
  });

  await maybeSaveReplay(env, playerId, requestId, requestPath, eventType, payload, response);

  trackAnalytics(env, eventType, {
    seasonId: season.seasonId,
    playerId,
    status: security.flagged ? 'flagged' : 'ok',
    value0: security.count,
    value1: security.highestScore,
    dayKey,
    ruleId: security.highestSeverity,
  });

  return json(response);
}

export async function mutationMatchResult({ env, playerId, payload, dayKey, state, season }) {
  const matchData = payload.matchData || {};
  const result = applyMatchResult(state, matchData);
  feedMatchIntoMissions(state, playerId, dayKey, matchData);
  await insertMatchEvent(env, playerId, season?.seasonId, result);
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

export async function mutationGachaPull({ payload, state }) {
  const result = applyGachaPull(state, payload || {});
  return { ok: true, result };
}

export async function handleLeaderboardGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') || 20);
  const archiveMode = ['1', 'true', 'yes'].includes(String(url.searchParams.get('archive') || '').toLowerCase());

  const dayKey = toDateKey();
  const activeSeason = await ensureSeason(env, dayKey);
  const seasonIdFromQuery = parseSeasonId(url.searchParams.get('season'));
  const targetSeasonId = seasonIdFromQuery || activeSeason.seasonId;

  const rows = archiveMode
    ? await fetchSeasonArchive(env, { seasonId: targetSeasonId, limit })
    : await fetchLeaderboard(env, targetSeasonId, limit);

  return json({
    ok: true,
    serverDate: dayKey,
    season: targetSeasonId,
    activeSeason: activeSeason.seasonId,
    archive: archiveMode,
    rows,
  });
}

export async function handleSeasonGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') || 12);
  const dayKey = toDateKey();

  const season = await ensureSeason(env, dayKey);
  const seasons = await listSeasons(env, limit);

  return json({
    ok: true,
    serverDate: dayKey,
    season,
    seasons,
  });
}

export async function handleOpsDailyRollup(context) {
  const authError = requireOps(context);
  if (authError) return authError;

  const { request, env } = context;
  const url = new URL(request.url);

  const body = await readEnvelope(request);
  const payload = body.payload || {};

  const dayKey = sanitizeDateKey(
    payload.dayKey
      || url.searchParams.get('day')
      || dateKeyOffset(toDateKey(), -1)
  ) || dateKeyOffset(toDateKey(), -1);

  const seasonFromPayload = parseSeasonId(payload.seasonId || url.searchParams.get('season'));
  const season = seasonFromPayload
    ? {
      seasonId: seasonFromPayload,
      label: `Season ${seasonFromPayload.slice(1, 5)}-${seasonFromPayload.slice(5, 7)}`,
      startsOn: `${seasonFromPayload.slice(1, 5)}-${seasonFromPayload.slice(5, 7)}-01`,
      endsOn: `${seasonFromPayload.slice(1, 5)}-${seasonFromPayload.slice(5, 7)}-31`,
      status: 'active',
    }
    : await ensureSeason(env, dayKey);

  const result = await runDailyRollup(env, {
    seasonId: season.seasonId,
    dayKey,
  });

  if (!result.ok) {
    return errorJson(result.reason || 'rollup_failed', 'daily rollup failed', 500);
  }

  trackAnalytics(env, 'ops_daily_rollup', {
    seasonId: season.seasonId,
    status: 'ok',
    value0: result.rollup.totalMatches,
    value1: result.rollup.anomalyCount,
    dayKey,
  });

  return json({
    ok: true,
    dbAvailable: dbAvailable(env),
    analyticsAvailable: analyticsAvailable(env),
    rollup: result.rollup,
  });
}

export async function handleOpsAnomaliesGet(context) {
  const authError = requireOps(context);
  if (authError) return authError;

  const { request, env } = context;
  const url = new URL(request.url);

  const seasonId = parseSeasonId(url.searchParams.get('season'));
  const playerId = String(url.searchParams.get('playerId') || '').trim();
  const minScore = Number(url.searchParams.get('minScore') || 0);
  const limit = Number(url.searchParams.get('limit') || 50);

  const rows = await fetchAnomalyEvents(env, {
    seasonId,
    playerId,
    minScore,
    limit,
  });

  return json({
    ok: true,
    count: rows.length,
    rows,
  });
}

export async function handleOpsRollupsGet(context) {
  const authError = requireOps(context);
  if (authError) return authError;

  const { request, env } = context;
  const url = new URL(request.url);
  const seasonId = parseSeasonId(url.searchParams.get('season'));
  const limit = Number(url.searchParams.get('limit') || 14);

  const rows = await fetchDailyRollups(env, {
    seasonId,
    limit,
  });

  return json({
    ok: true,
    count: rows.length,
    rows,
  });
}

export async function handleOpsSeasonRollover(context) {
  const authError = requireOps(context);
  if (authError) return authError;

  const { request, env } = context;
  const url = new URL(request.url);
  const envelope = await readEnvelope(request);
  const payload = envelope.payload || {};

  const targetSeasonId = parseSeasonId(
    payload.seasonId
      || url.searchParams.get('season')
      || '',
  ) || `S${toDateKey().replaceAll('-', '').slice(0, 6)}`;

  const startsOn = sanitizeDateKey(payload.startsOn);
  const endsOn = sanitizeDateKey(payload.endsOn);
  const label = String(payload.label || '').trim();
  const shouldArchivePrevious = payload.archivePrevious !== false;

  const setResult = await setSeasonActive(env, {
    seasonId: targetSeasonId,
    startsOn,
    endsOn,
    label,
  });

  if (!setResult.ok) {
    return errorJson(setResult.reason || 'season_rollover_failed', 'failed to activate season', 400);
  }

  let archiveResult = { ok: true, archivedPlayers: 0, skipped: true };
  if (setResult.changed && shouldArchivePrevious && setResult.previousSeasonId) {
    archiveResult = await archiveSeason(env, setResult.previousSeasonId);
  }

  trackAnalytics(env, 'ops_season_rollover', {
    seasonId: setResult.season.seasonId,
    status: setResult.changed ? 'changed' : 'noop',
    value0: archiveResult.archivedPlayers || 0,
    value1: setResult.changed ? 1 : 0,
    dayKey: toDateKey(),
  });

  return json({
    ok: true,
    changed: setResult.changed,
    previousSeasonId: setResult.previousSeasonId,
    season: setResult.season,
    archive: archiveResult,
  });
}
