import { clamp, clampInt } from './_util.js';

export const CURRENT_SCHEMA_VERSION = 2;
const LEDGER_MAX_ENTRIES = 500;
const EXP_PER_META_LEVEL_BASE = 1000;
const EXP_PER_BATTLEPASS_LEVEL = 500;
const BATTLEPASS_MAX_LEVEL = 30;

export const LOGIN_BONUS_TABLE = [
  { day: 1, type: 'credits', amount: 500, label: '500 クレジット' },
  { day: 2, type: 'gems', amount: 10, label: '10 ジェム' },
  { day: 3, type: 'credits', amount: 1000, label: '1000 クレジット' },
  { day: 4, type: 'gems', amount: 15, label: '15 ジェム' },
  { day: 5, type: 'credits', amount: 1500, label: '1500 クレジット' },
  { day: 6, type: 'gems', amount: 25, label: '25 ジェム' },
  { day: 7, type: 'gems', amount: 80, label: '80 ジェム ★' },
];

export const MISSION_DEFINITIONS = [
  { id: 'play_3', type: 'matches', target: 3, rewardType: 'credits', rewardAmount: 800 },
  { id: 'kill_10', type: 'kills', target: 10, rewardType: 'credits', rewardAmount: 600 },
  { id: 'dom_50', type: 'bestDomination', target: 50, rewardType: 'gems', rewardAmount: 15 },
  { id: 'kill_5_1', type: 'bestKillsSingle', target: 5, rewardType: 'gems', rewardAmount: 10 },
  { id: 'node_2', type: 'nodes', target: 2, rewardType: 'credits', rewardAmount: 500 },
  { id: 'win_1', type: 'wins', target: 1, rewardType: 'gems', rewardAmount: 20 },
];

const DAILY_MISSION_COUNT = 3;

export const BATTLE_PASS_REWARDS = [
  { level: 1, type: 'credits', amount: 300 },
  { level: 2, type: 'gems', amount: 10 },
  { level: 3, type: 'credits', amount: 500 },
  { level: 4, type: 'credits', amount: 500 },
  { level: 5, type: 'gems', amount: 20 },
  { level: 6, type: 'credits', amount: 800 },
  { level: 7, type: 'credits', amount: 800 },
  { level: 8, type: 'gems', amount: 25 },
  { level: 9, type: 'credits', amount: 1000 },
  { level: 10, type: 'gems', amount: 50 },
  { level: 11, type: 'credits', amount: 1000 },
  { level: 12, type: 'gems', amount: 15 },
  { level: 13, type: 'credits', amount: 1200 },
  { level: 14, type: 'credits', amount: 1200 },
  { level: 15, type: 'gems', amount: 30 },
  { level: 16, type: 'credits', amount: 1500 },
  { level: 17, type: 'credits', amount: 1500 },
  { level: 18, type: 'gems', amount: 35 },
  { level: 19, type: 'credits', amount: 2000 },
  { level: 20, type: 'gems', amount: 80 },
  { level: 21, type: 'credits', amount: 2000 },
  { level: 22, type: 'gems', amount: 20 },
  { level: 23, type: 'credits', amount: 2500 },
  { level: 24, type: 'credits', amount: 2500 },
  { level: 25, type: 'gems', amount: 40 },
  { level: 26, type: 'credits', amount: 3000 },
  { level: 27, type: 'credits', amount: 3000 },
  { level: 28, type: 'gems', amount: 50 },
  { level: 29, type: 'credits', amount: 5000 },
  { level: 30, type: 'gems', amount: 150 },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function buildDefaultState() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    level: 1,
    exp: 0,
    credits: 2000,
    gems: 500,
    unlockedCharacters: [1],
    selectedCharacterId: 1,
    upgrades: { hp: 0, speed: 0, magnet: 0 },
    loginBonus: { lastLoginDate: '', streak: 0 },
    missions: { daily: [], lastResetDate: '' },
    stats: {
      totalMatches: 0,
      totalKills: 0,
      totalNodesCaptured: 0,
      bestDomination: 0,
      bestKills: 0,
      winCount: 0,
    },
    characterData: {},
    pityCounter: 0,
    battlePass: { level: 0, exp: 0, claimed: [] },
    tutorialDone: false,
    notifications: { unclaimedMissions: 0, loginBonusPending: false },
    economyLedger: [],
  };
}

function sanitizeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function sanitizeCharacterData(raw) {
  const obj = sanitizeObject(raw);
  const result = {};

  Object.entries(obj).forEach(([k, v]) => {
    const safe = sanitizeObject(v);
    result[k] = {
      level: clampInt(safe.level ?? 1, 1, 999),
      exp: clampInt(safe.exp ?? 0, 0, 1e9),
      dupeCount: clampInt(safe.dupeCount ?? 0, 0, 1e6),
      uncap: clampInt(safe.uncap ?? 0, 0, 5),
    };
  });

  return result;
}

export function sanitizeStateSnapshot(snapshot) {
  const def = buildDefaultState();
  const raw = sanitizeObject(snapshot);

  const state = {
    ...def,
    ...raw,
    upgrades: { ...def.upgrades, ...sanitizeObject(raw.upgrades) },
    loginBonus: { ...def.loginBonus, ...sanitizeObject(raw.loginBonus) },
    missions: { ...def.missions, ...sanitizeObject(raw.missions) },
    stats: { ...def.stats, ...sanitizeObject(raw.stats) },
    battlePass: { ...def.battlePass, ...sanitizeObject(raw.battlePass) },
    notifications: { ...def.notifications, ...sanitizeObject(raw.notifications) },
    characterData: sanitizeCharacterData(raw.characterData),
  };

  state.schemaVersion = CURRENT_SCHEMA_VERSION;
  state.level = clampInt(state.level, 1, 999);
  state.exp = clampInt(state.exp, 0, 1e9);
  state.credits = clampInt(state.credits, 0, 1e12);
  state.gems = clampInt(state.gems, 0, 1e9);

  if (!Array.isArray(state.unlockedCharacters) || state.unlockedCharacters.length === 0) {
    state.unlockedCharacters = [1];
  }
  state.unlockedCharacters = [...new Set(state.unlockedCharacters.map((v) => clampInt(v, 1, 999)))];

  state.selectedCharacterId = clampInt(state.selectedCharacterId, 1, 999);
  if (!state.unlockedCharacters.includes(state.selectedCharacterId)) {
    state.selectedCharacterId = state.unlockedCharacters[0] || 1;
  }

  state.pityCounter = clampInt(state.pityCounter, 0, 60);
  state.battlePass.level = clampInt(state.battlePass.level, 0, BATTLEPASS_MAX_LEVEL);
  state.battlePass.exp = clampInt(state.battlePass.exp, 0, EXP_PER_BATTLEPASS_LEVEL - 1);
  state.battlePass.claimed = Array.isArray(state.battlePass.claimed)
    ? [...new Set(state.battlePass.claimed.map((v) => clampInt(v, 1, BATTLEPASS_MAX_LEVEL)))]
    : [];

  state.stats.totalMatches = clampInt(state.stats.totalMatches, 0, 1e9);
  state.stats.totalKills = clampInt(state.stats.totalKills, 0, 1e9);
  state.stats.totalNodesCaptured = clampInt(state.stats.totalNodesCaptured, 0, 1e9);
  state.stats.bestDomination = clamp(state.stats.bestDomination, 0, 100);
  state.stats.bestKills = clampInt(state.stats.bestKills, 0, 1e6);
  state.stats.winCount = clampInt(state.stats.winCount, 0, state.stats.totalMatches);

  state.missions.lastResetDate = typeof state.missions.lastResetDate === 'string' ? state.missions.lastResetDate : '';
  state.missions.daily = Array.isArray(state.missions.daily)
    ? state.missions.daily
      .map((item) => ({
        id: String(item?.id || ''),
        progress: clampInt(item?.progress ?? 0, 0, 1e9),
        claimed: Boolean(item?.claimed),
      }))
      .filter((item) => item.id)
    : [];

  state.loginBonus.lastLoginDate = typeof state.loginBonus.lastLoginDate === 'string' ? state.loginBonus.lastLoginDate : '';
  state.loginBonus.streak = clampInt(state.loginBonus.streak, 0, 100000);

  state.economyLedger = Array.isArray(state.economyLedger)
    ? state.economyLedger.slice(-LEDGER_MAX_ENTRIES)
    : [];

  return state;
}

export function appendEconomyLog(state, log) {
  if (!Array.isArray(state.economyLedger)) {
    state.economyLedger = [];
  }

  state.economyLedger.push({
    timestamp: new Date().toISOString(),
    ...log,
  });

  if (state.economyLedger.length > LEDGER_MAX_ENTRIES) {
    state.economyLedger.splice(0, state.economyLedger.length - LEDGER_MAX_ENTRIES);
  }
}

function addCredits(state, amount, source, meta = {}) {
  const before = state.credits;
  state.credits = Math.max(0, state.credits + amount);
  const delta = state.credits - before;
  if (delta !== 0) {
    appendEconomyLog(state, {
      category: 'credits',
      source,
      amount: delta,
      before,
      after: state.credits,
      meta,
    });
  }
  return delta;
}

function addGems(state, amount, source, meta = {}) {
  const before = state.gems;
  state.gems = Math.max(0, state.gems + amount);
  const delta = state.gems - before;
  if (delta !== 0) {
    appendEconomyLog(state, {
      category: 'gems',
      source,
      amount: delta,
      before,
      after: state.gems,
      meta,
    });
  }
  return delta;
}

function addMetaExp(state, amount, source, meta = {}) {
  const safeAmount = clampInt(amount, 0, 1e6);
  const before = state.exp;
  state.exp += safeAmount;

  let expNeeded = state.level * EXP_PER_META_LEVEL_BASE;
  while (state.exp >= expNeeded) {
    state.level += 1;
    state.exp -= expNeeded;
    addGems(state, 50, 'meta_levelup_bonus', { level: state.level });
    expNeeded = state.level * EXP_PER_META_LEVEL_BASE;
  }

  appendEconomyLog(state, {
    category: 'meta_exp',
    source,
    amount: safeAmount,
    before,
    after: state.exp,
    meta: { ...meta, level: state.level },
  });
}

function hashString(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandomFactory(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 100000) / 100000;
  };
}

export function rollDailyMissions(playerId, dayKey) {
  const rand = seededRandomFactory(hashString(`${playerId}:${dayKey}:missions`));
  const pool = clone(MISSION_DEFINITIONS);
  const selected = [];

  while (selected.length < DAILY_MISSION_COUNT && pool.length > 0) {
    const idx = Math.floor(rand() * pool.length);
    const mission = pool.splice(idx, 1)[0];
    selected.push({ id: mission.id, progress: 0, claimed: false });
  }

  return selected;
}

export function ensureDailyMissions(state, playerId, dayKey) {
  if (state.missions.lastResetDate === dayKey && Array.isArray(state.missions.daily) && state.missions.daily.length > 0) {
    return false;
  }

  state.missions.daily = rollDailyMissions(playerId, dayKey);
  state.missions.lastResetDate = dayKey;
  return true;
}

export function applyMatchResult(state, matchData = {}) {
  const dom = clamp(matchData.dominationPercent ?? 0, 0, 100);
  const kills = clampInt(matchData.kills ?? 0, 0, 2000);
  const nodes = clampInt(matchData.nodesCaptured ?? 0, 0, 1000);
  const weightedKills = kills + (nodes * 2);

  const creditsEarned = Math.floor(dom * 10) + (weightedKills * 50);
  const expEarned = Math.floor(dom * 5) + (weightedKills * 20);

  addCredits(state, creditsEarned, 'match_result', {
    domination: dom,
    kills: weightedKills,
    nodes,
  });
  addMetaExp(state, expEarned, 'match_result', {
    domination: dom,
    kills: weightedKills,
    nodes,
  });

  state.stats.totalMatches += 1;
  state.stats.totalKills += weightedKills;
  state.stats.totalNodesCaptured += nodes;
  state.stats.bestDomination = Math.max(state.stats.bestDomination, dom);
  state.stats.bestKills = Math.max(state.stats.bestKills, weightedKills);
  if (dom > 35) {
    state.stats.winCount += 1;
  }

  return {
    dominationPercent: dom,
    kills,
    weightedKills,
    nodesCaptured: nodes,
    creditsEarned,
    expEarned,
  };
}

export function addBattlePassExp(state, amount, source = 'unknown', meta = {}) {
  const safeAmount = clampInt(amount, 0, 5000);
  const beforeExp = state.battlePass.exp;
  const beforeLevel = state.battlePass.level;

  state.battlePass.exp += safeAmount;
  while (state.battlePass.exp >= EXP_PER_BATTLEPASS_LEVEL && state.battlePass.level < BATTLEPASS_MAX_LEVEL) {
    state.battlePass.exp -= EXP_PER_BATTLEPASS_LEVEL;
    state.battlePass.level += 1;
  }

  if (state.battlePass.level >= BATTLEPASS_MAX_LEVEL) {
    state.battlePass.exp = Math.min(state.battlePass.exp, EXP_PER_BATTLEPASS_LEVEL - 1);
  }

  appendEconomyLog(state, {
    category: 'battlepass_exp',
    source,
    amount: safeAmount,
    before: beforeExp,
    after: state.battlePass.exp,
    meta: {
      ...meta,
      levelBefore: beforeLevel,
      levelAfter: state.battlePass.level,
    },
  });

  return {
    amount: safeAmount,
    levelBefore: beforeLevel,
    levelAfter: state.battlePass.level,
    expAfter: state.battlePass.exp,
  };
}

export function claimMissionReward(state, playerId, dayKey, missionId) {
  ensureDailyMissions(state, playerId, dayKey);

  const mission = state.missions.daily.find((item) => item.id === missionId);
  if (!mission || mission.claimed) {
    return { ok: false, reason: 'mission_not_claimable' };
  }

  const def = MISSION_DEFINITIONS.find((item) => item.id === missionId);
  if (!def) {
    return { ok: false, reason: 'mission_not_found' };
  }

  if (mission.progress < def.target) {
    return { ok: false, reason: 'mission_not_completed' };
  }

  mission.claimed = true;

  if (def.rewardType === 'credits') {
    addCredits(state, def.rewardAmount, 'mission_reward', { missionId: def.id });
  } else {
    addGems(state, def.rewardAmount, 'mission_reward', { missionId: def.id });
  }

  return {
    ok: true,
    rewardType: def.rewardType,
    rewardAmount: def.rewardAmount,
    missionId: def.id,
  };
}

export function feedMatchIntoMissions(state, playerId, dayKey, matchData = {}) {
  ensureDailyMissions(state, playerId, dayKey);

  const kills = clampInt(matchData.kills ?? 0, 0, 2000);
  const dom = clamp(matchData.dominationPercent ?? 0, 0, 100);
  const nodes = clampInt(matchData.nodesCaptured ?? 0, 0, 1000);

  for (const mission of state.missions.daily) {
    const def = MISSION_DEFINITIONS.find((item) => item.id === mission.id);
    if (!def || mission.claimed) continue;

    switch (def.type) {
      case 'matches':
        mission.progress += 1;
        break;
      case 'kills':
        mission.progress += kills;
        break;
      case 'bestDomination':
        mission.progress = Math.max(mission.progress, dom);
        break;
      case 'bestKillsSingle':
        mission.progress = Math.max(mission.progress, kills);
        break;
      case 'nodes':
        mission.progress += nodes;
        break;
      case 'wins':
        if (dom > 35) {
          mission.progress += 1;
        }
        break;
      default:
        break;
    }
  }
}

export function claimLoginBonus(state, dayKey) {
  const last = state.loginBonus.lastLoginDate;
  if (last === dayKey) {
    return { ok: false, reason: 'already_claimed_today' };
  }

  const d = new Date(`${dayKey}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  const y = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

  let streak = clampInt(state.loginBonus.streak, 0, 100000);
  streak = last === y ? streak + 1 : 1;

  const dayIndex = (streak - 1) % LOGIN_BONUS_TABLE.length;
  const reward = LOGIN_BONUS_TABLE[dayIndex];

  if (reward.type === 'credits') {
    addCredits(state, reward.amount, 'login_bonus', { day: dayIndex + 1, streak });
  } else {
    addGems(state, reward.amount, 'login_bonus', { day: dayIndex + 1, streak });
  }

  state.loginBonus.lastLoginDate = dayKey;
  state.loginBonus.streak = streak;

  return {
    ok: true,
    dayIndex,
    streak,
    reward,
  };
}

export function claimBattlePassReward(state, level) {
  const safeLevel = clampInt(level, 1, BATTLEPASS_MAX_LEVEL);
  if (state.battlePass.level < safeLevel) {
    return { ok: false, reason: 'battlepass_level_locked' };
  }
  if (state.battlePass.claimed.includes(safeLevel)) {
    return { ok: false, reason: 'battlepass_already_claimed' };
  }

  const reward = BATTLE_PASS_REWARDS.find((item) => item.level === safeLevel);
  if (!reward) {
    return { ok: false, reason: 'battlepass_reward_not_found' };
  }

  if (reward.type === 'credits') {
    addCredits(state, reward.amount, 'battlepass_reward', { level: safeLevel });
  } else {
    addGems(state, reward.amount, 'battlepass_reward', { level: safeLevel });
  }

  state.battlePass.claimed.push(safeLevel);

  return {
    ok: true,
    level: safeLevel,
    reward,
  };
}

export function computeSeasonScore(state) {
  const s = state.stats;
  const dominationScore = Math.round(s.bestDomination * 10);
  const killsScore = s.totalKills * 2;
  const winScore = s.winCount * 100;
  return dominationScore + killsScore + winScore;
}

export function compactSnapshot(state) {
  return sanitizeStateSnapshot(state);
}
