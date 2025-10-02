import argon2 from 'argon2';

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
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hashedPassword, password);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}
