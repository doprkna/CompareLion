/**
 * Instant Submit preference (localStorage, no DB in v1)
 */
const STORAGE_KEY = 'parel:instantSubmit';

export function getInstantSubmit(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setInstantSubmit(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    //
  }
}
