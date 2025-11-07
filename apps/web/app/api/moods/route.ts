import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';

const DEFAULTS = [
  { key: 'chill', title: 'Lo‑Fi Chill', description: 'Calm tone, softer UI, low roast.' },
  { key: 'deep', title: 'Deep Night', description: 'Reflective tone, longer reads.' },
  { key: 'roast', title: 'Roast Mode', description: 'Edgier copy, cheeky toasts.' },
];

export const GET = safeAsync(async (_req: NextRequest) => {
  try {
    const dbPresets = await prisma.moodPreset.findMany({ where: { isActive: true } });
    const presets = (dbPresets?.length ? dbPresets : DEFAULTS);
    return NextResponse.json({ success: true, presets });
  } catch {
    return NextResponse.json({ success: true, presets: DEFAULTS });
  }
});


