import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const ChooseSchema = z.object({
  forkId: z.string().min(1),
  choice: z.enum(['A', 'B']),
});

function applyEffect(user: any, effect: any): { summary: string; changes: any } {
  const summary: string[] = [];
  const changes: any = {};

  if (effect.xp) {
    const xpChange = Math.round(user.xp * (effect.xp / 100));
    changes.xp = xpChange;
    if (xpChange > 0) summary.push(`+${xpChange} XP`);
    if (xpChange < 0) summary.push(`${xpChange} XP`);
  }

  if (effect.gold) {
    const goldChange = Math.round(Number(user.funds) * (effect.gold / 100));
    changes.funds = goldChange;
    if (goldChange > 0) summary.push(`+${goldChange} Gold`);
    if (goldChange < 0) summary.push(`${goldChange} Gold`);
  }

  if (effect.karma) {
    const karmaChange = Math.round(user.karmaScore * (effect.karma / 100));
    changes.karmaScore = karmaChange;
    if (karmaChange > 0) summary.push(`+${karmaChange} Karma`);
    if (karmaChange < 0) summary.push(`${karmaChange} Karma`);
  }

  if (effect.mood) {
    summary.push(`Mood: ${effect.mood}`);
  }

  return {
    summary: summary.join(', ') || 'No effect',
    changes,
  };
}

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = ChooseSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  const fork = await prisma.dailyFork.findUnique({ where: { id: parsed.data.forkId } });
  if (!fork || !fork.isActive) return notFoundError('Fork not found or inactive');

  // Check if already chosen
  const existing = await prisma.userDailyFork.findUnique({
    where: {
      userId_forkId: {
        userId: user.id,
        forkId: fork.id,
      },
    },
  });

  if (existing) {
    return validationError('Already made choice for this fork');
  }

  const effect = parsed.data.choice === 'A' ? fork.effectA : fork.effectB;
  const effectData = typeof effect === 'object' ? effect : (() => { try { return JSON.parse(effect || '{}'); } catch { return {}; } })(); // sanity-fix

  const { summary, changes } = applyEffect(user, effectData);

  await prisma.$transaction(async (tx) => {
    // Update user stats
    const updateData: any = {};
    if (changes.xp) updateData.xp = { increment: changes.xp };
    if (changes.funds !== undefined) updateData.funds = { increment: changes.funds };
    if (changes.karmaScore) updateData.karmaScore = { increment: changes.karmaScore };

    if (Object.keys(updateData).length > 0) {
      await tx.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    // Store choice
    await tx.userDailyFork.create({
      data: {
        userId: user.id,
        forkId: fork.id,
        choice: parsed.data.choice,
        resultSummary: summary,
      },
    });

    // Log action
    await tx.actionLog.create({
      data: {
        userId: user.id,
        action: 'daily_fork_choice',
        metadata: {
          forkId: fork.id,
          choice: parsed.data.choice,
          summary,
          changes,
        } as any,
      },
    });
  });

  return NextResponse.json({
    success: true,
    choice: parsed.data.choice,
    summary,
    changes,
  });
});

