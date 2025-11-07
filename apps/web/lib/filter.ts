/**
 * Profanity Filter for UGC Content
 * v0.17.0 - Basic implementation with expandable word list
 */

const PROFANITY_LIST = [
  // Basic profanity list - expand as needed
  'badword1',
  'badword2',
  'offensive',
  // Add more words here
];

const PROFANITY_PATTERN = new RegExp(
  PROFANITY_LIST.map(word => `\\b${word}\\b`).join('|'),
  'gi'
);

export interface FilterResult {
  isClean: boolean;
  flaggedWords: string[];
  cleanedText: string;
}

/**
 * Check if text contains profanity
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  return PROFANITY_PATTERN.test(text);
}

/**
 * Filter text and return detailed results
 */
export function filterText(text: string): FilterResult {
  if (!text) {
    return {
      isClean: true,
      flaggedWords: [],
      cleanedText: text,
    };
  }

  const flaggedWords: string[] = [];
  const matches = text.match(PROFANITY_PATTERN);
  
  if (matches) {
    matches.forEach(match => {
      if (!flaggedWords.includes(match.toLowerCase())) {
        flaggedWords.push(match.toLowerCase());
      }
    });
  }

  const cleanedText = text.replace(PROFANITY_PATTERN, '***');

  return {
    isClean: flaggedWords.length === 0,
    flaggedWords,
    cleanedText,
  };
}

/**
 * Validate UGC submission content
 */
export function validateUGCContent(
  title: string,
  content: string,
  description?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check title
  const titleFilter = filterText(title);
  if (!titleFilter.isClean) {
    errors.push(`Title contains inappropriate content: ${titleFilter.flaggedWords.join(', ')}`);
  }

  // Check content
  const contentFilter = filterText(content);
  if (!contentFilter.isClean) {
    errors.push(`Content contains inappropriate content: ${contentFilter.flaggedWords.join(', ')}`);
  }

  // Check description if provided
  if (description) {
    const descFilter = filterText(description);
    if (!descFilter.isClean) {
      errors.push(`Description contains inappropriate content: ${descFilter.flaggedWords.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

