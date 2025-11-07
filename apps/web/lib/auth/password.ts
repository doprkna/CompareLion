import argon2 from 'argon2';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

// Argon2id configuration for security
const ARGON2_CONFIG = {
  type: argon2.argon2id,
  timeCost: 3,        // Minimum recommended
  memoryCost: 65536,  // 64MB equivalent (65536 * 1024 bytes)
  parallelism: 1,
  hashLength: 32,
};

export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password, ARGON2_CONFIG);
  } catch (error) {
    logger.error('Password hashing error', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a plaintext password against a stored hash.
 * Supports both bcrypt ($2a$ / $2b$ / $2y$) and argon2 ($argon2) hashes.
 * Automatically detects hash type by prefix.
 * 
 * @param hashedPassword - The stored hash from database
 * @param password - The plaintext password to verify
 * @returns true if password matches, false otherwise
 */
export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false;
  }

  try {
    // Detect hash type by prefix
    if (hashedPassword.startsWith('$2a$') || 
        hashedPassword.startsWith('$2b$') || 
        hashedPassword.startsWith('$2y$')) {
      // bcrypt hash - verify with bcrypt
      return await bcrypt.compare(password, hashedPassword);
    }
    
    if (hashedPassword.startsWith('$argon2')) {
      // argon2 hash - verify with argon2
      return await argon2.verify(hashedPassword, password);
    }
    
    // Unknown hash format
    logger.warn('[auth] Unknown password hash format', { prefix: hashedPassword.slice(0, 10) });
    return false;
  } catch (error) {
    logger.error('[auth] Password verification failed', error);
    return false;
  }
}

/**
 * Check if a hash is bcrypt format (legacy)
 * Used to determine if password needs rehashing
 */
export function isBcryptHash(hash: string): boolean {
  return hash.startsWith('$2a$') || 
         hash.startsWith('$2b$') || 
         hash.startsWith('$2y$');
}

/**
 * Check if a hash is argon2 format (current)
 */
export function isArgon2Hash(hash: string): boolean {
  return hash.startsWith('$argon2');
}
