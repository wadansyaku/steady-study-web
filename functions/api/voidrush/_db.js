import {
  buildDefaultState,
  computeSeasonScore,
  sanitizeStateSnapshot,
} from './_state.js';
import { nowIso } from './_util.js';

function getDb(env) {
  return env?.VOIDRUSH_DB || null;
}

function safeJsonParse(text, fallback = null) {
  if (!text || typeof text !== 'string') return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export function dbAvailable(env) {
  return Boolean(getDb(env));
}

export async function loadPlayerState(env, playerId) {
  const db = getDb(env);
  const fallbackState = buildDefaultState();

  if (!db) {
    return {
      dbAvailable: false,
      exists: false,
      state: fallbackState,
      updatedAt: nowIso(),
    };
  }

  const row = await db
    .prepare('SELECT state_json, updated_at FROM voidrush_players WHERE player_id = ?1 LIMIT 1')
    .bind(playerId)
    .first();

  if (!row) {
    return {
      dbAvailable: true,
      exists: false,
      state: fallbackState,
      updatedAt: nowIso(),
    };
  }

  const parsed = safeJsonParse(row.state_json, fallbackState);
  return {
    dbAvailable: true,
    exists: true,
    state: sanitizeStateSnapshot(parsed),
    updatedAt: row.updated_at || nowIso(),
  };
}

export async function savePlayerState(env, playerId, state) {
  const db = getDb(env);
  if (!db) {
    return { ok: false, reason: 'db_unavailable' };
  }

  const safeState = sanitizeStateSnapshot(state);
  const stats = safeState.stats || {};
  const seasonScore = computeSeasonScore(safeState);

  await db
    .prepare(
      `INSERT INTO voidrush_players (
        player_id,
        schema_version,
        state_json,
        total_matches,
        total_kills,
        best_domination,
        win_count,
        season_score,
        created_at,
        updated_at,
        last_seen_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(player_id) DO UPDATE SET
        schema_version = excluded.schema_version,
        state_json = excluded.state_json,
        total_matches = excluded.total_matches,
        total_kills = excluded.total_kills,
        best_domination = excluded.best_domination,
        win_count = excluded.win_count,
        season_score = excluded.season_score,
        updated_at = CURRENT_TIMESTAMP,
        last_seen_at = CURRENT_TIMESTAMP`
    )
    .bind(
      playerId,
      safeState.schemaVersion,
      JSON.stringify(safeState),
      Number(stats.totalMatches || 0),
      Number(stats.totalKills || 0),
      Number(stats.bestDomination || 0),
      Number(stats.winCount || 0),
      Number(seasonScore || 0),
    )
    .run();

  return {
    ok: true,
    seasonScore,
    state: safeState,
  };
}

export async function getRequestReplay(env, playerId, requestId) {
  const db = getDb(env);
  if (!db || !requestId) return null;

  const row = await db
    .prepare('SELECT response_json FROM voidrush_requests WHERE player_id = ?1 AND request_id = ?2 LIMIT 1')
    .bind(playerId, requestId)
    .first();

  if (!row?.response_json) return null;
  return safeJsonParse(row.response_json, null);
}

export async function saveRequestReplay(env, playerId, requestId, path, eventType, payload, response) {
  const db = getDb(env);
  if (!db || !requestId) return { ok: false, reason: 'db_or_requestid_missing' };

  try {
    await db
      .prepare(
        `INSERT INTO voidrush_requests (
          player_id,
          request_id,
          path,
          event_type,
          payload_json,
          response_json,
          created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP)`
      )
      .bind(
        playerId,
        requestId,
        path,
        eventType,
        JSON.stringify(payload || {}),
        JSON.stringify(response || {}),
      )
      .run();

    return { ok: true };
  } catch (error) {
    const message = String(error?.message || error || '');
    if (message.includes('UNIQUE') || message.includes('constraint failed')) {
      return { ok: false, duplicate: true };
    }
    throw error;
  }
}

export async function insertMatchEvent(env, playerId, matchResult) {
  const db = getDb(env);
  if (!db) return { ok: false, reason: 'db_unavailable' };

  await db
    .prepare(
      `INSERT INTO voidrush_match_events (
        player_id,
        domination_percent,
        kills,
        nodes_captured,
        credits_earned,
        exp_earned,
        created_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP)`
    )
    .bind(
      playerId,
      Number(matchResult.dominationPercent || 0),
      Number(matchResult.kills || 0),
      Number(matchResult.nodesCaptured || 0),
      Number(matchResult.creditsEarned || 0),
      Number(matchResult.expEarned || 0),
    )
    .run();

  return { ok: true };
}

export async function fetchLeaderboard(env, limit = 20) {
  const db = getDb(env);
  if (!db) return [];

  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const result = await db
    .prepare(
      `SELECT
        player_id,
        total_matches,
        total_kills,
        best_domination,
        win_count,
        season_score,
        updated_at
      FROM voidrush_players
      ORDER BY season_score DESC, total_kills DESC, best_domination DESC
      LIMIT ?1`
    )
    .bind(safeLimit)
    .all();

  return (result?.results || []).map((row, index) => ({
    rank: index + 1,
    playerId: row.player_id,
    totalMatches: Number(row.total_matches || 0),
    totalKills: Number(row.total_kills || 0),
    bestDomination: Number(row.best_domination || 0),
    winCount: Number(row.win_count || 0),
    seasonScore: Number(row.season_score || 0),
    updatedAt: row.updated_at,
  }));
}
