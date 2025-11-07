import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export type Lang = 'en' | 'cs';

export interface RequestLocale {
  lang: Lang;
  region: string; // e.g., 'global', 'CZ'
}

export async function getRequestLocale(req: NextRequest): Promise<RequestLocale> {
  const url = new URL(req.url);
  const qpLang = (url.searchParams.get('lang') as Lang | null) || null;
  const qpRegion = url.searchParams.get('region');

  // Prefer explicit query params
  if (qpLang || qpRegion) {
    return {
      lang: (qpLang || 'en'),
      region: (qpRegion || 'global'),
    };
  }

  // Fallback to session user settings
  const session = await getServerSession(authOptions);
  const user = session?.user as any | undefined;
  const userLang = (user?.lang as Lang | undefined) || (user?.language as Lang | undefined);
  const userRegion = (user?.region as string | undefined) || 'global';

  return {
    lang: userLang || 'en',
    region: userRegion || 'global',
  };
}


