function toFinite(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toSafeText(value, maxLen = 128) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

export function analyticsAvailable(env) {
  return typeof env?.VOIDRUSH_ANALYTICS?.writeDataPoint === 'function';
}

export function writeAnalyticsPoint(env, eventName, fields = {}) {
  if (!analyticsAvailable(env)) return false;

  const dataset = env.VOIDRUSH_ANALYTICS;
  try {
    dataset.writeDataPoint({
      blobs: [
        toSafeText(eventName, 64),
        toSafeText(fields.seasonId, 32),
        toSafeText(fields.playerId, 128),
        toSafeText(fields.status, 32),
      ],
      doubles: [
        toFinite(fields.value0),
        toFinite(fields.value1),
      ],
      indexes: [
        toSafeText(fields.ruleId, 64),
        toSafeText(fields.dayKey, 16),
      ],
    });
    return true;
  } catch {
    return false;
  }
}
