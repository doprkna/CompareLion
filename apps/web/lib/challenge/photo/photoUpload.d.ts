/**
 * Photo Upload Utilities
 * Handle image file uploads for photo challenges
 * v0.37.12 - Photo Challenge
 */
/**
 * Validate image file
 */
export declare function validateImageFile(file: File): {
    valid: boolean;
    error?: string;
};
/**
 * Save uploaded image file
 *
 * @param file - File object from FormData
 * @param userId - User ID for filename
 * @returns Public URL path to the saved file
 */
export declare function saveImageFile(file: File, userId: string): Promise<string>;
