import { en } from '@/locales/en';
import { cs } from '@/locales/cs';
import { es } from '@/locales/es';

type Pack = Record<string, any> & { meta?: { version?: string; updatedAt?: string } };

const REGISTRY: Record<string, Pack> = {
  en,
  cs,
  es,
};

const memoryCache: Record<string, { etag: string; pack: Pack; at: number }> = {};

function computeEtag(pack: Pack): string {
  const version = pack?.meta?.version || '0';
  const updatedAt = pack?.meta?.updatedAt || '';
  return `v:${version}|t:${updatedAt}`;
}

export async function loadPack(lang: string): Promise<{ pack: Pack; etag: string }> {
  const key = (lang || 'en').toLowerCase();
  const fromReg = REGISTRY[key] || REGISTRY['en'];
  const etag = computeEtag(fromReg);
  memoryCache[key] = { etag, pack: fromReg, at: Date.now() };
  return { pack: fromReg, etag };
}

export function getCachedPack(lang: string): { pack: Pack; etag: string } | null {
  const key = (lang || 'en').toLowerCase();
  const hit = memoryCache[key];
  return hit ? { pack: hit.pack, etag: hit.etag } : null;
}


