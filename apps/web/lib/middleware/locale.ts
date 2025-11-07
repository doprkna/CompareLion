import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export type LocaleCode = string; // e.g., 'en-US', 'cs-CZ', 'en', 'global'

export function resolveLocaleChain(locale: string): LocaleCode[] {
  if (!locale) return ['en-US', 'en', 'global'];
  const parts = locale.split('-');
  const base = parts[0];
  if (parts.length > 1) {
    return [locale, base, 'global'];
  }
  return [base, 'global'];
}

export async function getRequestLocaleChain(req: NextRequest): Promise<LocaleCode[]> {
  // Query param override
  const url = new URL(req.url);
  const qp = url.searchParams.get('locale');
  if (qp) return resolveLocaleChain(qp);

  // Session user
  const session = await getServerSession(authOptions);
  const userLocale = (session?.user as any)?.localeCode as string | undefined;
  if (userLocale) return resolveLocaleChain(userLocale);

  // Accept-Language header (use first tag)
  const header = req.headers.get('accept-language') || '';
  const first = header.split(',')[0]?.trim();
  if (first) return resolveLocaleChain(first);

  return resolveLocaleChain('en-US');
}

export function sortByLocalePreference<T extends { localeCode?: string | null }>(items: T[], chain: LocaleCode[]): T[] {
  const priority = new Map(chain.map((c, i) => [c, i] as const));
  const score = (code?: string | null): number => {
    if (!code) return 99;
    return priority.get(code) ?? (priority.get(code.split('-')[0]) ?? 98);
  };
  return [...items].sort((a, b) => score(a.localeCode) - score(b.localeCode));
}


