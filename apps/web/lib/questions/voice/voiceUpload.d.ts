/**
 * Voice Upload Utilities
 * Handle audio file uploads for voice replies
 * v0.37.9 - Voice Replies
 */
/**
 * Validate audio file
 */
export declare function validateAudioFile(file: File): {
    valid: boolean;
    error?: string;
};
/**
 * Save uploaded audio file
 *
 * @param file - File object from FormData
 * @param userId - User ID for filename
 * @returns Public URL path to the saved file
 */
export declare function saveAudioFile(file: File, userId: string): Promise<string>;
