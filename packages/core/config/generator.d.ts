/**
 * Question Generator Configuration
 *
 * Controls the automated question generation system:
 * - Throughput and concurrency
 * - Language support
 * - GPT API integration
 * - Admin security
 */
export declare const GEN_CONFIG: {
    MAX_CONCURRENCY: number;
    QUESTIONS_PER_CATEGORY_MIN: number;
    QUESTIONS_PER_CATEGORY_MAX: number;
    LANGUAGES: string[];
    GPT_URL: string;
    GPT_KEY: string;
    ADMIN_TOKEN: string;
    DRY_RUN: boolean;
    BATCH_SIZE: number;
    MAX_RETRIES: number;
    RETRY_DELAY_MS: number;
};
/**
 * Validate generator configuration
 * Throws if required settings are missing
 */
export declare function validateGeneratorConfig(): {
    valid: boolean;
    errors: string[];
};
