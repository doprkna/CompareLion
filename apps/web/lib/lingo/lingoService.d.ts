/**
 * CompareLingo Service 1.0
 * AI-powered language rating system for jokes, slang, captions, etc.
 * v0.40.4 - CompareLingo 1.0 (Slang, Joke, Caption Rating)
 */
export type LingoMode = 'joke' | 'slang' | 'caption' | 'pickup' | 'meme' | 'msg';
export interface LingoRating {
    scores: {
        humor: number;
        clarity: number;
        vibe: number;
    };
    vibeTag: string;
    lingoType: string;
    feedback: string;
    suggestion?: string;
}
export interface LingoError {
    error: 'unsafe_content' | 'invalid_input' | 'ai_error';
    message?: string;
}
/**
 * Rate text using CompareLingo AI
 */
export declare function rateTextLingo(text: string, mode: LingoMode): Promise<LingoRating | LingoError>;
