/**
 * Automated flagging service (v1 rule-based)
 */

import { containsBannedKeyword } from './bannedKeywords';

export interface AutoFlagContext {
  text: string;
  userId?: string;
  accountCreatedAt?: Date;
  postCountLast24h?: number;
  entityType: string;
}

const REPORT_THRESHOLD = 3;
const HOURS_WINDOW = 24;
const NEW_ACCOUNT_DAYS = 7;
const POST_FREQUENCY_PER_HOUR = 10;
const AUTO_FLAG_SCORE_THRESHOLD = 5;

/**
 * Run auto-flag rules. Returns score delta and whether to flag.
 */
export function autoFlag(context: AutoFlagContext): {
  scoreDelta: number;
  shouldFlag: boolean;
} {
  let score = 0;

  if (containsBannedKeyword(context.text)) {
    score += 10;
  }

  if (
    context.accountCreatedAt &&
    context.postCountLast24h != null
  ) {
    const accountAgeDays =
      (Date.now() - context.accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (accountAgeDays < NEW_ACCOUNT_DAYS && context.postCountLast24h > POST_FREQUENCY_PER_HOUR) {
      score += 5;
    }
  }

  return {
    scoreDelta: score,
    shouldFlag: score >= AUTO_FLAG_SCORE_THRESHOLD,
  };
}

export { REPORT_THRESHOLD, HOURS_WINDOW };
