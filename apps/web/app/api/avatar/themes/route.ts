import { NextRequest, NextResponse } from 'next/server';
import { safeAsync } from '@/lib/api-handler';

const THEMES = [
  { key: 'classic', name: 'Classic', colors: ['#111827', '#60A5FA'] },
  { key: 'sunset', name: 'Sunset', colors: ['#7C3AED', '#F59E0B'] },
  { key: 'mint', name: 'Mint', colors: ['#065F46', '#34D399'] },
];

export const GET = safeAsync(async (_req: NextRequest) => {
  return NextResponse.json({ success: true, themes: THEMES });
});


