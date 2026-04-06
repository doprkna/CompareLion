export declare function hashPassword(password: string): Promise<string>;
/**
 * Verify a plaintext password against a stored hash.
 * Supports both bcrypt ($2a$ / $2b$ / $2y$) and argon2 ($argon2) hashes.
 * Automatically detects hash type by prefix.
 *
 * @param hashedPassword - The stored hash from database
 * @param password - The plaintext password to verify
 * @returns true if password matches, false otherwise
 */
export declare function verifyPassword(hashedPassword: string, password: string): Promise<boolean>;
/**
 * Check if a hash is bcrypt format (legacy)
 * Used to determine if password needs rehashing
 */
export declare function isBcryptHash(hash: string): boolean;
/**
 * Check if a hash is argon2 format (current)
 */
export declare function isArgon2Hash(hash: string): boolean;
