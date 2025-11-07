/**
 * Content Moderation Utilities
 * v0.20.0 - Simple profanity and abuse detection
 */

// Basic profanity/abuse word list (expandable)
const PROFANITY_PATTERNS = [
  /\b(fuck|shit|bitch|asshole|damn|crap|bastard|dick|pussy|cock)\b/gi,
  /\b(nigger|nigga|fag|faggot|retard|cunt|whore|slut)\b/gi,
  /\b(kill yourself|kys|die|suicide|rape)\b/gi,
  /(https?:\/\/[^\s]+)/gi, // Block URLs for now
];

export interface ModerationResult {
  flagged: boolean;
  reasons: string[];
  cleanContent?: string;
}

/**
 * Check content for profanity and abuse
 */
export function moderateContent(content: string): ModerationResult {
  const reasons: string[] = [];
  let flagged = false;

  // Check each pattern
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(content)) {
      flagged = true;
      if (pattern.source.includes('https')) {
        reasons.push('Contains URL');
      } else {
        reasons.push('Inappropriate language');
      }
    }
  }

  // Check for spam (repeated characters)
  if (/(.)\1{10,}/.test(content)) {
    flagged = true;
    reasons.push('Spam detected');
  }

  // Check for all caps (more than 70% uppercase)
  const uppercaseCount = (content.match(/[A-Z]/g) || []).length;
  const letterCount = (content.match(/[a-zA-Z]/g) || []).length;
  if (letterCount > 10 && uppercaseCount / letterCount > 0.7) {
    flagged = true;
    reasons.push('Excessive caps');
  }

  // Optional: clean content by replacing profanity with asterisks
  let cleanContent = content;
  for (const pattern of PROFANITY_PATTERNS) {
    if (!pattern.source.includes('https')) {
      cleanContent = cleanContent.replace(pattern, (match) => '*'.repeat(match.length));
    }
  }

  return {
    flagged,
    reasons: [...new Set(reasons)], // Remove duplicates
    cleanContent: flagged ? cleanContent : content,
  };
}

/**
 * Check if content is safe to display
 */
export function isSafeContent(content: string): boolean {
  const result = moderateContent(content);
  return !result.flagged;
}

/**
 * Get user's flagged content count (for rate limiting)
 */
export async function getUserFlaggedCount(userId: string, prisma: any): Promise<number> {
  const [messageCount, commentCount] = await Promise.all([
    prisma.message.count({
      where: { senderId: userId, flagged: true },
    }),
    prisma.comment.count({
      where: { userId, flagged: true },
    }),
  ]);

  return messageCount + commentCount;
}

/**
 * Check if user should be rate limited based on flagged content
 */
export async function shouldRateLimit(userId: string, prisma: any): Promise<boolean> {
  const flaggedCount = await getUserFlaggedCount(userId, prisma);
  return flaggedCount >= 5; // Rate limit after 5 flagged items
}

