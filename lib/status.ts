export type WaterStatus = 'normal' | 'watch' | 'critical' | 'no-data';
export type Trend = 'rising' | 'falling' | 'steady';
export type Freshness = 'fresh' | 'stale' | 'no-data';

/** Maps ThaiWater's 5-level situation_level to our 3-tier status */
export function toStatus(situationLevel: number | null, freshness: Freshness = 'fresh'): WaterStatus {
  if (freshness === 'no-data') return 'no-data';
  if (situationLevel === 1) return 'normal';
  if (situationLevel === 2 || situationLevel === 3) return 'watch';
  if (situationLevel === 4 || situationLevel === 5) return 'critical';
  // null or unknown -> no-data for status, we rely on trend instead
  return 'no-data';
}

/** Computes trend from last N readings (requires ≥2 readings) */
export function toTrend(levels: number[], thresholdDelta = 0.02): Trend {
  if (levels.length < 2) return 'steady';
  const latest = levels[levels.length - 1];
  const previous = levels[levels.length - 2];
  
  if (latest - previous > thresholdDelta) return 'rising';
  if (previous - latest > thresholdDelta) return 'falling';
  return 'steady';
}

/** Area status = worst status among its stations */
export function areaStatus(statuses: WaterStatus[]): WaterStatus {
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('watch')) return 'watch';
  if (statuses.includes('normal')) return 'normal';
  return 'no-data';
}

/** Data freshness check */
export function toFreshness(lastTs: Date, now: Date = new Date()): Freshness {
  const diffMinutes = (now.getTime() - lastTs.getTime()) / (1000 * 60);
  if (diffMinutes < 60) return 'fresh';
  if (diffMinutes <= 24 * 60) return 'stale';
  return 'no-data';
}
