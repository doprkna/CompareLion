import { WILDCARDS, WildcardEvent } from '@/lib/config/wildcards';

type CacheEntry = { event: WildcardEvent | null; expiresAt: number };

const cache: Record<string, CacheEntry> = {};

function getTodayKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function resolveWildcard(date: Date, region?: string, lang?: string): WildcardEvent | null {
  const dateKey = getTodayKey(date);
  const r = (region || 'GLOBAL').toUpperCase();
  const l = (lang || 'en').toLowerCase();
  const fromFile = WILDCARDS[dateKey] || {};

  // Fallback chain: region → lang → global
  return (
    fromFile[r] ||
    fromFile[l] ||
    fromFile['global'] ||
    null
  );
}

export function getWildcardForToday(region?: string, lang?: string): WildcardEvent | null {
  const now = new Date();
  const key = `${getTodayKey(now)}:${(region || 'GLOBAL').toUpperCase()}:${(lang || 'en').toLowerCase()}`;
  const nowMs = Date.now();

  const existing = cache[key];
  if (existing && existing.expiresAt > nowMs) return existing.event;

  const event = resolveWildcard(now, region, lang);
  // Expire at the next UTC midnight (+5 min buffer)
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 5, 0));
  cache[key] = { event, expiresAt: tomorrow.getTime() };
  return event;
}

export function preloadWildcardsNextDays(days: number = 7) {
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i));
    const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    const group = (WILDCARDS as any)[dateKey] || {};
    for (const scope of Object.keys(group)) {
      const event = group[scope] as WildcardEvent;
      const key = `${dateKey}:${scope.toUpperCase()}:en`;
      const expires = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 5, 0)).getTime();
      cache[key] = { event, expiresAt: expires };
    }
  }
}


