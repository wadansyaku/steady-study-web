import {
  buildDefaultState,
  computeSeasonScore,
  sanitizeStateSnapshot,
} from './_state.js';
import { nowIso, toDateKey } from './_util.js';

const DEFAULT_SEASON_ID = 'S0';

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

function toSafeInt(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(n);
}

function toSafeFloat(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return n;
}

function monthEndDay(year, month) {
  const d = new Date(Date.UTC(year, month, 0));
  return String(d.getUTCDate()).padStart(2, '0');
}

export function deriveSeasonFromDate(dayKey = toDateKey()) {
  const safe = /^\d{4}-\d{2}-\d{2}$/.test(dayKey) ? dayKey : toDateKey();
  const [yearText, monthText] = safe.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const seasonId = `S${yearText}${monthText}`;

  return {
    seasonId,
    label: `Season ${yearText}-${monthText}`,
    startsOn: `${yearText}-${monthText}-01`,
    endsOn: `${yearText}-${monthText}-${monthEndDay(year, month)}`,
    status: 'active',
  };
}

export function dbAvailable(env) {
  return Boolean(getDb(env));
}

export async function ensureSeason(env, dayKey = toDateKey()) {
  const db = getDb(env);
  const fallback = deriveSeasonFromDate(dayKey);
  const safeDayKey = /^\d{4}-\d{2}-\d{2}$/.test(dayKey) ? dayKey : toDateKey();

  if (!db) {
    return {
      dbAvailable: false,
      ...fallback,
    };
  }

  const active = await db
    .prepare(
      `SELECT
        season_id,
        label,
        starts_on,
        ends_on,
        status
      FROM voidrush_seasons
      WHERE status = 'active'
      ORDER BY updated_at DESC
      LIMIT 1`
    )
    .first();

  if (active) {
    const startsOn = String(active.starts_on || '0000-00-00');
    const endsOn = String(active.ends_on || '9999-12-31');
    const isStillActiveWindow = safeDayKey <= endsOn || safeDayKey < startsOn;

    if (isStillActiveWindow) {
      return {
        dbAvailable: true,
        seasonId: active.season_id,
        label: active.label,
        startsOn: startsOn,
        endsOn: endsOn,
        status: active.status || 'active',
      };
    }
  }

  const next = deriveSeasonFromDate(safeDayKey);

  await db
    .prepare(
      `INSERT INTO voidrush_seasons (
        season_id,
        label,
        starts_on,
        ends_on,
        status,
        created_at,
        updated_at
      ) VALUES (?1, ?2, ?3, ?4, 'scheduled', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(season_id) DO UPDATE SET
        label = excluded.label,
        starts_on = excluded.starts_on,
        ends_on = excluded.ends_on,
        updated_at = CURRENT_TIMESTAMP`
    )
    .bind(next.seasonId, next.label, next.startsOn, next.endsOn)
    .run();

  await db
    .prepare("UPDATE voidrush_seasons SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE status = 'active' AND season_id <> ?1")
    .bind(next.seasonId)
    .run();

  await db
    .prepare("UPDATE voidrush_seasons SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE season_id = ?1")
    .bind(next.seasonId)
    .run();

  const row = await db
    .prepare(
      `SELECT
        season_id,
        label,
        starts_on,
        ends_on,
        status
      FROM voidrush_seasons
      WHERE season_id = ?1
      LIMIT 1`
    )
    .bind(next.seasonId)
    .first();

  if (!row) {
    return {
      dbAvailable: true,
      ...next,
    };
  }

  return {
    dbAvailable: true,
    seasonId: row.season_id,
    label: row.label,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    status: row.status || 'active',
  };
}

export async function setSeasonActive(env, seasonInput = {}) {
  const db = getDb(env);
  if (!db) {
    const fallback = deriveSeasonFromDate(toDateKey());
    return {
      ok: false,
      reason: 'db_unavailable',
      season: fallback,
    };
  }

  const seasonId = String(seasonInput.seasonId || '').trim();
  if (!seasonId) {
    return { ok: false, reason: 'season_id_required' };
  }

  const startsOn = /^\d{4}-\d{2}-\d{2}$/.test(String(seasonInput.startsOn || ''))
    ? String(seasonInput.startsOn)
    : `${seasonId.slice(1, 5)}-${seasonId.slice(5, 7)}-01`;

  const endsOn = /^\d{4}-\d{2}-\d{2}$/.test(String(seasonInput.endsOn || ''))
    ? String(seasonInput.endsOn)
    : `${seasonId.slice(1, 5)}-${seasonId.slice(5, 7)}-${monthEndDay(Number(seasonId.slice(1, 5)), Number(seasonId.slice(5, 7)))}`;

  const label = String(seasonInput.label || `Season ${startsOn.slice(0, 7)}`).slice(0, 80);

  const previous = await db
    .prepare("SELECT season_id FROM voidrush_seasons WHERE status = 'active' LIMIT 1")
    .first();

  await db
    .prepare(
      `INSERT INTO voidrush_seasons (
        season_id,
        label,
        starts_on,
        ends_on,
        status,
        created_at,
        updated_at
      ) VALUES (?1, ?2, ?3, ?4, 'scheduled', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(season_id) DO UPDATE SET
        label = excluded.label,
        starts_on = excluded.starts_on,
        ends_on = excluded.ends_on,
        updated_at = CURRENT_TIMESTAMP`
    )
    .bind(seasonId, label, startsOn, endsOn)
    .run();

  await db
    .prepare("UPDATE voidrush_seasons SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE status = 'active' AND season_id <> ?1")
    .bind(seasonId)
    .run();

  await db
    .prepare("UPDATE voidrush_seasons SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE season_id = ?1")
    .bind(seasonId)
    .run();

  const row = await db
    .prepare(
      `SELECT
        season_id,
        label,
        starts_on,
        ends_on,
        status
      FROM voidrush_seasons
      WHERE season_id = ?1
      LIMIT 1`
    )
    .bind(seasonId)
    .first();

  return {
    ok: true,
    changed: previous?.season_id ? previous.season_id !== seasonId : true,
    previousSeasonId: previous?.season_id || null,
    season: {
      seasonId: row?.season_id || seasonId,
      label: row?.label || label,
      startsOn: row?.starts_on || startsOn,
      endsOn: row?.ends_on || endsOn,
      status: row?.status || 'active',
    },
  };
}

export async function loadPlayerState(env, playerId) {
  const db = getDb(env);
  const fallbackState = buildDefaultState();

  if (!db) {
    return {
      dbAvailable: false,
      exists: false,
      seasonId: DEFAULT_SEASON_ID,
      state: fallbackState,
      updatedAt: nowIso(),
    };
  }

  const row = await db
    .prepare('SELECT season_id, state_json, updated_at FROM voidrush_players WHERE player_id = ?1 LIMIT 1')
    .bind(playerId)
    .first();

  if (!row) {
    return {
      dbAvailable: true,
      exists: false,
      seasonId: DEFAULT_SEASON_ID,
      state: fallbackState,
      updatedAt: nowIso(),
    };
  }

  const parsed = safeJsonParse(row.state_json, fallbackState);
  return {
    dbAvailable: true,
    exists: true,
    seasonId: row.season_id || DEFAULT_SEASON_ID,
    state: sanitizeStateSnapshot(parsed),
    updatedAt: row.updated_at || nowIso(),
  };
}

export async function savePlayerState(env, playerId, state, seasonId = DEFAULT_SEASON_ID) {
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
        season_id,
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
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(player_id) DO UPDATE SET
        season_id = excluded.season_id,
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
      seasonId,
      safeState.schemaVersion,
      JSON.stringify(safeState),
      toSafeInt(stats.totalMatches || 0),
      toSafeInt(stats.totalKills || 0),
      toSafeFloat(stats.bestDomination || 0),
      toSafeInt(stats.winCount || 0),
      toSafeInt(seasonScore || 0),
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

export async function insertMatchEvent(env, playerId, seasonId, matchResult) {
  const db = getDb(env);
  if (!db) return { ok: false, reason: 'db_unavailable' };

  await db
    .prepare(
      `INSERT INTO voidrush_match_events (
        player_id,
        season_id,
        domination_percent,
        kills,
        nodes_captured,
        credits_earned,
        exp_earned,
        created_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP)`
    )
    .bind(
      playerId,
      seasonId || DEFAULT_SEASON_ID,
      toSafeFloat(matchResult.dominationPercent || 0),
      toSafeInt(matchResult.weightedKills || matchResult.kills || 0),
      toSafeInt(matchResult.nodesCaptured || 0),
      toSafeInt(matchResult.creditsEarned || 0),
      toSafeInt(matchResult.expEarned || 0),
    )
    .run();

  return { ok: true };
}

export async function fetchLeaderboard(env, seasonId, limit = 20) {
  const db = getDb(env);
  if (!db) return [];

  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const targetSeason = String(seasonId || DEFAULT_SEASON_ID);

  const result = await db
    .prepare(
      `SELECT
        player_id,
        COUNT(*) AS total_matches,
        SUM(kills) AS total_kills,
        MAX(domination_percent) AS best_domination,
        SUM(CASE WHEN domination_percent > 35 THEN 1 ELSE 0 END) AS win_count,
        CAST(ROUND((MAX(domination_percent) * 10.0) + (SUM(kills) * 2.0) + (SUM(CASE WHEN domination_percent > 35 THEN 1 ELSE 0 END) * 100.0)) AS INTEGER) AS season_score,
        MAX(created_at) AS updated_at
      FROM voidrush_match_events
      WHERE season_id = ?1
      GROUP BY player_id
      ORDER BY season_score DESC, total_kills DESC, best_domination DESC
      LIMIT ?2`
    )
    .bind(targetSeason, safeLimit)
    .all();

  return (result?.results || []).map((row, index) => ({
    rank: index + 1,
    playerId: row.player_id,
    totalMatches: toSafeInt(row.total_matches || 0),
    totalKills: toSafeInt(row.total_kills || 0),
    bestDomination: toSafeFloat(row.best_domination || 0),
    winCount: toSafeInt(row.win_count || 0),
    seasonScore: toSafeInt(row.season_score || 0),
    updatedAt: row.updated_at,
  }));
}

export async function saveAnomalyEvents(env, {
  seasonId,
  playerId,
  eventType,
  flags = [],
}) {
  const db = getDb(env);
  if (!db) return { ok: false, count: 0, reason: 'db_unavailable' };
  if (!Array.isArray(flags) || flags.length === 0) return { ok: true, count: 0 };

  let count = 0;
  for (const flag of flags) {
    await db
      .prepare(
        `INSERT INTO voidrush_anomaly_events (
          season_id,
          player_id,
          event_type,
          rule_id,
          severity,
          score,
          detail_json,
          created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP)`
      )
      .bind(
        seasonId || DEFAULT_SEASON_ID,
        playerId,
        eventType,
        String(flag?.ruleId || 'unknown_rule').slice(0, 64),
        String(flag?.severity || 'warn').slice(0, 16),
        toSafeInt(flag?.score || 0),
        JSON.stringify(flag?.detail || {}),
      )
      .run();
    count += 1;
  }

  return { ok: true, count };
}

export async function fetchAnomalyEvents(env, {
  seasonId = '',
  playerId = '',
  minScore = 0,
  limit = 50,
} = {}) {
  const db = getDb(env);
  if (!db) return [];

  const where = ['score >= ?1'];
  const binds = [Math.max(0, toSafeInt(minScore, 0))];

  if (seasonId) {
    where.push(`season_id = ?${binds.length + 1}`);
    binds.push(String(seasonId));
  }
  if (playerId) {
    where.push(`player_id = ?${binds.length + 1}`);
    binds.push(String(playerId));
  }

  const safeLimit = Math.max(1, Math.min(200, toSafeInt(limit, 50)));
  binds.push(safeLimit);

  const sql = `SELECT
      id,
      season_id,
      player_id,
      event_type,
      rule_id,
      severity,
      score,
      detail_json,
      created_at
    FROM voidrush_anomaly_events
    WHERE ${where.join(' AND ')}
    ORDER BY created_at DESC
    LIMIT ?${binds.length}`;

  const result = await db.prepare(sql).bind(...binds).all();

  return (result?.results || []).map((row) => ({
    id: toSafeInt(row.id, 0),
    seasonId: row.season_id,
    playerId: row.player_id,
    eventType: row.event_type,
    ruleId: row.rule_id,
    severity: row.severity,
    score: toSafeInt(row.score, 0),
    detail: safeJsonParse(row.detail_json, {}),
    createdAt: row.created_at,
  }));
}

export async function runDailyRollup(env, {
  seasonId,
  dayKey,
}) {
  const db = getDb(env);
  if (!db) {
    return {
      ok: false,
      reason: 'db_unavailable',
    };
  }

  const safeSeasonId = String(seasonId || DEFAULT_SEASON_ID);
  const safeDayKey = /^\d{4}-\d{2}-\d{2}$/.test(String(dayKey || '')) ? String(dayKey) : toDateKey();

  const matchStats = await db
    .prepare(
      `SELECT
        COUNT(*) AS total_matches,
        COUNT(DISTINCT player_id) AS active_players,
        SUM(kills) AS total_kills,
        SUM(credits_earned) AS credits_earned,
        SUM(exp_earned) AS exp_earned,
        MAX(domination_percent) AS best_domination
      FROM voidrush_match_events
      WHERE season_id = ?1
        AND substr(created_at, 1, 10) = ?2`
    )
    .bind(safeSeasonId, safeDayKey)
    .first();

  const anomalyStats = await db
    .prepare(
      `SELECT COUNT(*) AS anomaly_count
      FROM voidrush_anomaly_events
      WHERE season_id = ?1
        AND substr(created_at, 1, 10) = ?2`
    )
    .bind(safeSeasonId, safeDayKey)
    .first();

  const rollup = {
    seasonId: safeSeasonId,
    dayKey: safeDayKey,
    activePlayers: toSafeInt(matchStats?.active_players || 0),
    totalMatches: toSafeInt(matchStats?.total_matches || 0),
    totalKills: toSafeInt(matchStats?.total_kills || 0),
    creditsEarned: toSafeInt(matchStats?.credits_earned || 0),
    expEarned: toSafeInt(matchStats?.exp_earned || 0),
    anomalyCount: toSafeInt(anomalyStats?.anomaly_count || 0),
    bestDomination: toSafeFloat(matchStats?.best_domination || 0),
  };

  await db
    .prepare(
      `INSERT INTO voidrush_daily_rollups (
        season_id,
        day_key,
        active_players,
        total_matches,
        total_kills,
        credits_earned,
        exp_earned,
        anomaly_count,
        best_domination,
        generated_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, CURRENT_TIMESTAMP)
      ON CONFLICT(season_id, day_key) DO UPDATE SET
        active_players = excluded.active_players,
        total_matches = excluded.total_matches,
        total_kills = excluded.total_kills,
        credits_earned = excluded.credits_earned,
        exp_earned = excluded.exp_earned,
        anomaly_count = excluded.anomaly_count,
        best_domination = excluded.best_domination,
        generated_at = CURRENT_TIMESTAMP`
    )
    .bind(
      rollup.seasonId,
      rollup.dayKey,
      rollup.activePlayers,
      rollup.totalMatches,
      rollup.totalKills,
      rollup.creditsEarned,
      rollup.expEarned,
      rollup.anomalyCount,
      rollup.bestDomination,
    )
    .run();

  return {
    ok: true,
    rollup,
  };
}

export async function fetchDailyRollups(env, {
  seasonId = '',
  limit = 14,
} = {}) {
  const db = getDb(env);
  if (!db) return [];

  const safeLimit = Math.max(1, Math.min(120, Number(limit) || 14));

  let sql = `SELECT
      season_id,
      day_key,
      active_players,
      total_matches,
      total_kills,
      credits_earned,
      exp_earned,
      anomaly_count,
      best_domination,
      generated_at
    FROM voidrush_daily_rollups`;

  if (seasonId) {
    sql += ' WHERE season_id = ?1 ORDER BY day_key DESC LIMIT ?2';
    const result = await db.prepare(sql).bind(String(seasonId), safeLimit).all();
    return (result?.results || []).map((row) => ({
      seasonId: row.season_id,
      dayKey: row.day_key,
      activePlayers: toSafeInt(row.active_players || 0),
      totalMatches: toSafeInt(row.total_matches || 0),
      totalKills: toSafeInt(row.total_kills || 0),
      creditsEarned: toSafeInt(row.credits_earned || 0),
      expEarned: toSafeInt(row.exp_earned || 0),
      anomalyCount: toSafeInt(row.anomaly_count || 0),
      bestDomination: toSafeFloat(row.best_domination || 0),
      generatedAt: row.generated_at,
    }));
  }

  sql += ' ORDER BY day_key DESC LIMIT ?1';
  const result = await db.prepare(sql).bind(safeLimit).all();
  return (result?.results || []).map((row) => ({
    seasonId: row.season_id,
    dayKey: row.day_key,
    activePlayers: toSafeInt(row.active_players || 0),
    totalMatches: toSafeInt(row.total_matches || 0),
    totalKills: toSafeInt(row.total_kills || 0),
    creditsEarned: toSafeInt(row.credits_earned || 0),
    expEarned: toSafeInt(row.exp_earned || 0),
    anomalyCount: toSafeInt(row.anomaly_count || 0),
    bestDomination: toSafeFloat(row.best_domination || 0),
    generatedAt: row.generated_at,
  }));
}

export async function archiveSeason(env, seasonId) {
  const db = getDb(env);
  if (!db) return { ok: false, reason: 'db_unavailable', archivedPlayers: 0 };

  const safeSeasonId = String(seasonId || '').trim();
  if (!safeSeasonId) {
    return { ok: false, reason: 'season_id_required', archivedPlayers: 0 };
  }

  const result = await db
    .prepare(
      `SELECT
        player_id,
        COUNT(*) AS total_matches,
        SUM(kills) AS total_kills,
        MAX(domination_percent) AS best_domination,
        SUM(CASE WHEN domination_percent > 35 THEN 1 ELSE 0 END) AS win_count,
        CAST(ROUND((MAX(domination_percent) * 10.0) + (SUM(kills) * 2.0) + (SUM(CASE WHEN domination_percent > 35 THEN 1 ELSE 0 END) * 100.0)) AS INTEGER) AS season_score
      FROM voidrush_match_events
      WHERE season_id = ?1
      GROUP BY player_id`
    )
    .bind(safeSeasonId)
    .all();

  const rows = result?.results || [];
  for (const row of rows) {
    await db
      .prepare(
        `INSERT INTO voidrush_season_archives (
          season_id,
          player_id,
          total_matches,
          total_kills,
          best_domination,
          win_count,
          season_score,
          archived_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP)
        ON CONFLICT(season_id, player_id) DO UPDATE SET
          total_matches = excluded.total_matches,
          total_kills = excluded.total_kills,
          best_domination = excluded.best_domination,
          win_count = excluded.win_count,
          season_score = excluded.season_score,
          archived_at = CURRENT_TIMESTAMP`
      )
      .bind(
        safeSeasonId,
        row.player_id,
        toSafeInt(row.total_matches || 0),
        toSafeInt(row.total_kills || 0),
        toSafeFloat(row.best_domination || 0),
        toSafeInt(row.win_count || 0),
        toSafeInt(row.season_score || 0),
      )
      .run();
  }

  return {
    ok: true,
    archivedPlayers: rows.length,
  };
}

export async function fetchSeasonArchive(env, {
  seasonId,
  limit = 20,
} = {}) {
  const db = getDb(env);
  if (!db) return [];

  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const targetSeasonId = String(seasonId || '').trim();
  if (!targetSeasonId) return [];

  const result = await db
    .prepare(
      `SELECT
        player_id,
        total_matches,
        total_kills,
        best_domination,
        win_count,
        season_score,
        archived_at
      FROM voidrush_season_archives
      WHERE season_id = ?1
      ORDER BY season_score DESC, total_kills DESC, best_domination DESC
      LIMIT ?2`
    )
    .bind(targetSeasonId, safeLimit)
    .all();

  return (result?.results || []).map((row, index) => ({
    rank: index + 1,
    playerId: row.player_id,
    totalMatches: toSafeInt(row.total_matches || 0),
    totalKills: toSafeInt(row.total_kills || 0),
    bestDomination: toSafeFloat(row.best_domination || 0),
    winCount: toSafeInt(row.win_count || 0),
    seasonScore: toSafeInt(row.season_score || 0),
    archivedAt: row.archived_at,
  }));
}

export async function listSeasons(env, limit = 12) {
  const db = getDb(env);
  if (!db) return [];

  const safeLimit = Math.max(1, Math.min(60, Number(limit) || 12));
  const result = await db
    .prepare(
      `SELECT
        season_id,
        label,
        starts_on,
        ends_on,
        status,
        updated_at
      FROM voidrush_seasons
      ORDER BY starts_on DESC
      LIMIT ?1`
    )
    .bind(safeLimit)
    .all();

  return (result?.results || []).map((row) => ({
    seasonId: row.season_id,
    label: row.label,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    status: row.status,
    updatedAt: row.updated_at,
  }));
}
