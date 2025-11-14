import Redis from 'ioredis';
import { prisma } from '@/lib/db';
import { safeRuntime } from '@/lib/safe-runtime';

type Severity = 'info' | 'warn' | 'block';

export interface CulturalFilter {
  id: string;
  region: string;
  tag: string;
  category: string | null;
  description: string | null;
  severity: Severity;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationInput {
  region: string | null | undefined;
  tags: string[];
}

export interface EvaluationResult {
  action: 'none' | 'info' | 'warn' | 'block';
  matched: CulturalFilter[];
}

const REDIS_URL = process.env.REDIS_URL;
let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!_redis && REDIS_URL) {
    try {
      _redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: true });
    } catch {
      _redis = null;
    }
  }
  return _redis;
}

const LOCAL_TTL_MS = 5 * 60 * 1000; // 5 minutes
const localCache = new Map<string, { value: CulturalFilter[]; expiresAt: number }>();

function makeKey(region: string) {
  return `filters:${region.toUpperCase()}`;
}

export async function invalidateFilters(region: string) {
  const key = makeKey(region);
  localCache.delete(key);
  const redis = getRedis();
  if (redis) {
    try { await redis.del(key); } catch {}
  }
}

async function getFromLocal(key: string): Promise<CulturalFilter[] | null> {
  const entry = localCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    localCache.delete(key);
    return null;
  }
  return entry.value;
}

async function setLocal(key: string, value: CulturalFilter[]) {
  localCache.set(key, { value, expiresAt: Date.now() + LOCAL_TTL_MS });
}

export async function loadActiveFilters(regionInput?: string | null): Promise<CulturalFilter[]> {
  const region = (regionInput || 'GLOBAL').toUpperCase();
  const key = makeKey(region);

  const cachedLocal = await getFromLocal(key);
  if (cachedLocal) return cachedLocal;

  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get(key);
      if (raw) {
        const parsed = JSON.parse(raw) as CulturalFilter[];
        await setLocal(key, parsed);
        return parsed;
      }
    } catch {}
  }

  const filters = await prisma.culturalFilter.findMany({
    where: { region: { in: [region, 'GLOBAL'] } },
    orderBy: { updatedAt: 'desc' },
  }) as unknown as CulturalFilter[];

  const redis = getRedis();
  if (redis) {
    try { await redis.set(key, JSON.stringify(filters), 'EX', 300); } catch {}
  }
  await setLocal(key, filters);
  return filters;
}

export async function evaluateContent(input: EvaluationInput): Promise<EvaluationResult> {
  const region = input.region || 'GLOBAL';
  const tags = input.tags?.map(t => t.toLowerCase()) || [];
  const filters = await loadActiveFilters(region);

  const matched = filters.filter(f => tags.includes((f.tag || '').toLowerCase()));
  const hasBlock = matched.some(m => m.severity === 'block');
  const hasWarn = matched.some(m => m.severity === 'warn');
  const hasInfo = matched.some(m => m.severity === 'info');

  if (hasBlock) return { action: 'block', matched };
  if (hasWarn) return { action: 'warn', matched };
  if (hasInfo) return { action: 'info', matched };
  return { action: 'none', matched: [] };
}


