import { clampInt } from './_util.js';
import { computeSeasonScore } from './_state.js';

function pushFlag(flags, {
  eventType,
  ruleId,
  severity = 'warn',
  score = 10,
  detail = {},
}) {
  flags.push({
    eventType,
    ruleId,
    severity,
    score: clampInt(score, 1, 100),
    detail,
  });
}

export function detectAnomalies({
  eventType,
  payload = {},
  beforeState,
  afterState,
}) {
  const flags = [];
  if (!beforeState || !afterState) return flags;

  const creditsDelta = Number(afterState.credits || 0) - Number(beforeState.credits || 0);
  const gemsDelta = Number(afterState.gems || 0) - Number(beforeState.gems || 0);
  const scoreDelta = computeSeasonScore(afterState) - computeSeasonScore(beforeState);

  if (creditsDelta > 100000) {
    pushFlag(flags, {
      eventType,
      ruleId: 'credits_spike',
      severity: creditsDelta > 200000 ? 'critical' : 'warn',
      score: Math.min(100, Math.round(creditsDelta / 4000)),
      detail: { creditsDelta },
    });
  }

  if (gemsDelta > 3000) {
    pushFlag(flags, {
      eventType,
      ruleId: 'gems_spike',
      severity: gemsDelta > 6000 ? 'critical' : 'warn',
      score: Math.min(100, Math.round(gemsDelta / 120)),
      detail: { gemsDelta },
    });
  }

  if (scoreDelta > 6000) {
    pushFlag(flags, {
      eventType,
      ruleId: 'season_score_spike',
      severity: scoreDelta > 12000 ? 'critical' : 'warn',
      score: Math.min(100, Math.round(scoreDelta / 150)),
      detail: { scoreDelta },
    });
  }

  if (eventType === 'match_result') {
    const matchData = payload.matchData || {};
    const rawKills = Number(matchData.kills || 0);
    const rawNodes = Number(matchData.nodesCaptured || 0);
    const rawDom = Number(matchData.dominationPercent || 0);

    if (rawKills > 80) {
      pushFlag(flags, {
        eventType,
        ruleId: 'match_high_kills',
        severity: rawKills > 120 ? 'critical' : 'warn',
        score: Math.min(100, Math.round(rawKills)),
        detail: { rawKills },
      });
    }

    if (rawNodes > 20) {
      pushFlag(flags, {
        eventType,
        ruleId: 'match_high_nodes',
        severity: 'warn',
        score: Math.min(100, Math.round(rawNodes * 2)),
        detail: { rawNodes },
      });
    }

    if (rawDom > 100 || rawDom < 0) {
      pushFlag(flags, {
        eventType,
        ruleId: 'match_domination_out_of_range',
        severity: 'critical',
        score: 100,
        detail: { rawDom },
      });
    }
  }

  if (eventType === 'snapshot_upload') {
    if (creditsDelta > 50000 || gemsDelta > 1500 || scoreDelta > 3000) {
      pushFlag(flags, {
        eventType,
        ruleId: 'snapshot_large_jump',
        severity: 'warn',
        score: 75,
        detail: {
          creditsDelta,
          gemsDelta,
          scoreDelta,
        },
      });
    }
  }

  return flags;
}

export function summarizeAnomalies(flags) {
  if (!Array.isArray(flags) || flags.length === 0) {
    return {
      flagged: false,
      count: 0,
      highestSeverity: 'none',
      highestScore: 0,
    };
  }

  const severityRank = { none: 0, warn: 1, critical: 2 };
  let highest = 'none';
  let highestScore = 0;

  for (const item of flags) {
    const sev = item?.severity || 'warn';
    if ((severityRank[sev] || 0) > (severityRank[highest] || 0)) {
      highest = sev;
    }
    highestScore = Math.max(highestScore, clampInt(item?.score || 0, 0, 100));
  }

  return {
    flagged: true,
    count: flags.length,
    highestSeverity: highest,
    highestScore,
  };
}
