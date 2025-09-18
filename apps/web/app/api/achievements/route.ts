import { NextResponse } from 'next/server';
import type { Achievement } from '@/types/achievement';
import { ACHIEVEMENTS } from '@/data/achievements';

export async function GET() {
  return NextResponse.json({ success: true, achievements: ACHIEVEMENTS }, { status: 200 });
}
