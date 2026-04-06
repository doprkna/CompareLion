/**
 * Banned keywords for auto-flagging (v1)
 * Extend via config/env later.
 */
export const BANNED_KEYWORDS = [
  'spam',
  'scam',
  'phishing',
  // Add more as needed
];

export function containsBannedKeyword(text: string): boolean {
  const lower = (text || '').toLowerCase();
  return BANNED_KEYWORDS.some((kw) => lower.includes(kw));
}
