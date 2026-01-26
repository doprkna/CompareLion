/**
 * Photo Upload Utilities
 * Handle image file uploads for photo challenges
 * v0.37.12 - Photo Challenge
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'photo-challenge');

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Save uploaded image file
 * 
 * @param file - File object from FormData
 * @param userId - User ID for filename
 * @returns Public URL path to the saved file
 */
export async function saveImageFile(file: File, userId: string): Promise<string> {
  await ensureUploadDir();

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = file.name.split('.').pop() || 'jpg';
  const filename = `${userId}_${timestamp}_${random}.${extension}`;
  const filepath = join(UPLOAD_DIR, filename);

  // Convert File to Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Write file
  await writeFile(filepath, buffer);

  // Return public URL path (relative to /public)
  return `/uploads/photo-challenge/${filename}`;
}

