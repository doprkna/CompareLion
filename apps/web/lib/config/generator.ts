/**
 * Question Generator Configuration
 * 
 * Controls the automated question generation system:
 * - Throughput and concurrency
 * - Language support
 * - GPT API integration
 * - Admin security
 */

export const GEN_CONFIG = {
  // Control throughput
  MAX_CONCURRENCY: Number(process.env.NEXT_PUBLIC_GEN_MAX_CONCURRENCY || 2),
  QUESTIONS_PER_CATEGORY_MIN: Number(process.env.NEXT_PUBLIC_Q_PER_CAT_MIN || 5),
  QUESTIONS_PER_CATEGORY_MAX: Number(process.env.NEXT_PUBLIC_Q_PER_CAT_MAX || 12),

  // Language handling
  LANGUAGES: (process.env.NEXT_PUBLIC_GEN_LANGS || 'en').split(',').map(s => s.trim()),

  // GPT endpoint configuration
  GPT_URL: process.env.GPT_GEN_URL || '',          // e.g. https://api.your-gpt/generate
  GPT_KEY: process.env.GPT_GEN_KEY || '',          // API key for GPT endpoint

  // Admin security (simple for MVP)
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || '',

  // Dry run and safety
  DRY_RUN: process.env.NEXT_PUBLIC_GEN_DRY_RUN === 'true',
  
  // Batch processing settings
  BATCH_SIZE: Number(process.env.NEXT_PUBLIC_GEN_BATCH_SIZE || 50),
  
  // Retry settings
  MAX_RETRIES: Number(process.env.NEXT_PUBLIC_GEN_MAX_RETRIES || 3),
  RETRY_DELAY_MS: Number(process.env.NEXT_PUBLIC_GEN_RETRY_DELAY || 1000),
};

/**
 * Validate generator configuration
 * Throws if required settings are missing
 */
export function validateGeneratorConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!GEN_CONFIG.GPT_URL) {
    errors.push('GPT_GEN_URL is required');
  }

  if (GEN_CONFIG.MAX_CONCURRENCY < 1) {
    errors.push('MAX_CONCURRENCY must be at least 1');
  }

  if (GEN_CONFIG.QUESTIONS_PER_CATEGORY_MIN < 1) {
    errors.push('QUESTIONS_PER_CATEGORY_MIN must be at least 1');
  }

  if (GEN_CONFIG.QUESTIONS_PER_CATEGORY_MAX < GEN_CONFIG.QUESTIONS_PER_CATEGORY_MIN) {
    errors.push('QUESTIONS_PER_CATEGORY_MAX must be >= QUESTIONS_PER_CATEGORY_MIN');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

