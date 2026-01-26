/**
 * Voice Upload Utilities
 * Handle audio file uploads for voice replies
 * v0.37.9 - Voice Replies
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MAX_FILE_SIZE = 500 * 1024; // 500 KB
const MAX_DURATION_SECONDS = 30;
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'voice');

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Validate audio file
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024}KB`,
    };
  }

  // Check MIME type
  const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Save uploaded audio file
 * 
 * @param file - File object from FormData
 * @param userId - User ID for filename
 * @returns Public URL path to the saved file
 */
export async function saveAudioFile(file: File, userId: string): Promise<string> {
  await ensureUploadDir();

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = file.name.split('.').pop() || 'webm';
  const filename = `${userId}_${timestamp}_${random}.${extension}`;
  const filepath = join(UPLOAD_DIR, filename);

  // Convert File to Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Write file
  await writeFile(filepath, buffer);

  // Return public URL path (relative to /public)
  return `/uploads/voice/${filename}`;
}

