/**
 * Admin View Detection Utility (Client-Side)
 * v0.35.16c - Client-only, no server imports
 */

/**
 * Client-side admin view check (browser-based)
 */
export function isAdminView() {
  if (typeof window === 'undefined') return true;
  
  return process.env.NODE_ENV !== 'production' ||
         window?.localStorage?.getItem('forceAdmin') === 'true';
}
