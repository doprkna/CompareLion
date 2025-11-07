import Redis from 'ioredis';
import { prisma } from '@/lib/db';

export interface AIContextDTO {
  region: string;
  localeCode: string;
  toneProfile?: string | null;
  culturalNotes?: string | null;
  humorStyle?: string | null;
  tabooTopics?: string[] | null;
}

const REDIS_URL = process.env.REDIS_URL;
let redis: Redis | null = null;
try {
  if (REDIS_URL) {
    redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: true });
  }
} catch {
  redis = null;
}

const ONE_DAY_SECONDS = 60 * 60 * 24;

function toRegionFromLocale(locale?: string | null): string | null {
  if (!locale) return null;
  const parts = locale.split('-');
  return parts.length > 1 ? parts[1].toUpperCase() : null;
}

function makeCacheKey(region: string) {
  return `aiContext:${region.toUpperCase()}`;
}

async function getCached(region: string): Promise<AIContextDTO | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(makeCacheKey(region));
    return raw ? (JSON.parse(raw) as AIContextDTO) : null;
  } catch {
    return null;
  }
}

async function setCached(region: string, value: AIContextDTO) {
  if (!redis) return;
  try {
    await redis.set(makeCacheKey(region), JSON.stringify(value), 'EX', ONE_DAY_SECONDS);
  } catch {}
}

export async function invalidateAIContext(region: string) {
  if (!redis) return;
  try { await redis.del(makeCacheKey(region)); } catch {}
}

function toDTO(row: any): AIContextDTO {
  return {
    region: row.region,
    localeCode: row.localeCode,
    toneProfile: row.toneProfile ?? null,
    culturalNotes: row.culturalNotes ?? null,
    humorStyle: row.humorStyle ?? null,
    tabooTopics: (row.tabooTopics as string[] | null) ?? null,
  };
}

export async function getAIContext(localeOrRegion?: string | null): Promise<AIContextDTO> {
  const locale = localeOrRegion || 'en-US';
  const regionFromLocale = toRegionFromLocale(locale);
  const region = (regionFromLocale || localeOrRegion || 'GLOBAL').toUpperCase();

  // cache by region only
  const fromCache = await getCached(region);
  if (fromCache) return fromCache;

  // Fallback order: region -> locale -> GLOBAL
  const byRegion = await prisma.aIRegionalContext.findFirst({
    where: { region },
  });
  if (byRegion) {
    const dto = toDTO(byRegion);
    await setCached(region, dto);
    return dto;
  }

  if (locale) {
    const byLocale = await prisma.aIRegionalContext.findFirst({
      where: { localeCode: locale },
    });
    if (byLocale) {
      const dto = toDTO(byLocale);
      await setCached(region, dto);
      return dto;
    }
  }

  const global = await prisma.aIRegionalContext.findFirst({
    where: { region: 'GLOBAL' },
  });

  const dto = toDTO(
    global || { region: 'GLOBAL', localeCode: 'en-US', toneProfile: null, culturalNotes: null, humorStyle: null, tabooTopics: null }
  );
  await setCached(region, dto);
  return dto;
}

export function validateAIContextInput(input: Partial<AIContextDTO>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (input.culturalNotes && input.culturalNotes.length > 1000) errors.push('culturalNotes too long');
  if (input.toneProfile && input.toneProfile.length > 200) errors.push('toneProfile too long');
  if (input.humorStyle && input.humorStyle.length > 200) errors.push('humorStyle too long');
  return { valid: errors.length === 0, errors };
}


