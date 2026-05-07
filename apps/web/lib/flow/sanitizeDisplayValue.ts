export function sanitizeDisplayValue(input: string | null | undefined): string {
  const value = (input ?? '').trim();
  if (value.length < 3) return '';
  if (/^[a-z0-9]{7,}$/i.test(value) && !/[aeiou]/i.test(value)) return '';
  if (/^[a-z]{8,}$/i.test(value) && !/\s/.test(value) && /[bcdfghjklmnpqrstvwxyz]{6,}/i.test(value)) return '';
  return value;
}

export function formatDisplayName(name: string | null | undefined, userId: string): string {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return `Player #${userId.slice(-4)}`;
  if (/demo/i.test(trimmed) || /^user\s*\d+$/i.test(trimmed) || /^[a-z]*\d{2,}$/i.test(trimmed)) {
    return `Player #${userId.slice(-4)}`;
  }
  return trimmed;
}

export const sanitizeParallelName = formatDisplayName;
