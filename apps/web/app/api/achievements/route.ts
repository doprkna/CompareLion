import { NextResponse } from 'next/server';
import type { Achievement } from '@/types/achievement';
import { ACHIEVEMENTS } from '@/data/achievements';
import { toAchievementDTO, AchievementDTO } from '@/lib/dto/achievementDTO';

export async function GET() {
  const dto: AchievementDTO[] = ACHIEVEMENTS.map(toAchievementDTO);
  return NextResponse.json({ success: true, achievements: dto }, { status: 200 });
}
