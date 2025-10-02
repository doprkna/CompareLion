import { randomBytes } from 'crypto';

export function generateToken(): string {
  // Generate 32 bytes (256 bits) of random data and encode as hex
  return randomBytes(32).toString('hex');
}

export function getTokenExpiry(): Date {
  // Tokens expire in 24 hours
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
