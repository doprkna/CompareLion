/**
 * Question Type Definitions with Localization Support
 * v0.23.0 - Phase G: Localization & Regional Logic
 */
/**
 * Localization metadata for questions
 */
export interface QuestionLocalization {
    lang?: string[];
    region?: string[];
    excludeRegions?: string[];
}
/**
 * Base Question type with localization support
 */
export interface Question {
    id: string;
    text: string;
    category?: string;
    difficulty?: string;
    metadata?: any;
    lang?: string[];
    region?: string[];
    excludeRegions?: string[];
}
/**
 * Extended Question with full metadata
 */
export interface QuestionWithLocalization extends Question {
    localization: QuestionLocalization;
}
/**
 * Helper to extract localization from question metadata
 */
export declare function getQuestionLocalization(question: any): QuestionLocalization;
/**
 * Helper to check if question matches language
 */
export declare function matchesLanguage(question: Question, targetLang: string): boolean;
/**
 * Helper to check if question matches region
 */
export declare function matchesRegion(question: Question, targetRegion: string): boolean;
/**
 * Filter questions by language and region
 */
export declare function filterQuestionsByLocale(questions: Question[], lang?: string, region?: string): Question[];
