/**
 * Synthetic global stats - credible, non-round numbers for "You vs The World" report.
 * Deterministic: hash(questionId + dayKey) so numbers stay stable within a day.
 * Placeholder for real-data blend when available.
 */

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h = h & 0xffffffff;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const DAY_KEY = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

/** Non-round percentiles: 18, 41, 63, 77 etc. */
const PERCENTILE_POOL = [18, 23, 31, 41, 47, 53, 59, 63, 67, 72, 77, 81, 86, 91];

export interface SyntheticGlobalStats {
  n: number;
  globalPercentYes?: number;
  globalAvg?: number;
  percentileForUserAnswer?: number;
}

/**
 * Get synthetic stats for a question. Deterministic per questionId + day + optional region.
 */
export function getSyntheticGlobalStats(
  questionId: string,
  questionType: 'SINGLE_CHOICE' | 'NUMERIC' | 'TEXT',
  userAnswer?: { optionValue?: string; numericVal?: number; textVal?: string },
  _userRegion?: string
): SyntheticGlobalStats {
  const dayKey = DAY_KEY();
  const seed = hash(`${questionId}-${dayKey}`);
  const r1 = seededRandom(seed);
  const r2 = seededRandom(seed + 1);
  const r3 = seededRandom(seed + 2);

  // N: stable per day, non-round (e.g. 312, 287, 441)
  const nBase = 250 + Math.floor(r1 * 250);
  const n = nBase + (nBase % 10 === 0 ? 7 : 0);

  const out: SyntheticGlobalStats = { n };

  if (questionType === 'SINGLE_CHOICE' && userAnswer?.optionValue !== undefined) {
    const yesPct = Math.round(10 + r2 * 80);
    out.globalPercentYes = yesPct;
    out.percentileForUserAnswer = PERCENTILE_POOL[Math.floor(r3 * PERCENTILE_POOL.length)] ?? 63;
  }

  if (questionType === 'NUMERIC' && userAnswer?.numericVal !== undefined) {
    const avgBase = 4 + r2 * 4;
    const h = Math.floor(avgBase);
    const m = Math.floor((avgBase - h) * 60);
    out.globalAvg = h + m / 60;
  }

  return out;
}

/** Format hours as "Xh Ym" */
export function formatHours(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}
