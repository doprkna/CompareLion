import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const CheckSchema = z.object({
  trigger: z.enum(['reflection', 'mission', 'comparison', 'levelup', 'random']),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = CheckSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  // Anti-spam cooldown: 1 trigger check per minute
  const oneMinAgo = new Date(Date.now() - 60 * 1000);
  const recentCheck = await prisma.userLootMoment.findFirst({
    where: {
      userId: user.id,
      triggeredAt: { gte: oneMinAgo },
    },
  });

  if (recentCheck) {
    return NextResponse.json({
      success: true,
      triggered: false,
      message: 'Cooldown active',
    });
  }

  // Check daily limits: 1 major, 3 minor events max
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayLoot = await prisma.userLootMoment.findMany({
    where: {
      userId: user.id,
      triggeredAt: { gte: today },
    },
    include: { moment: true },
  });

  const majorCount = todayLoot.filter((l) => 
    ['epic', 'legendary'].includes(l.moment.rarity)
  ).length;

  const minorCount = todayLoot.filter((l) => 
    ['common', 'rare'].includes(l.moment.rarity)
  ).length;

  if (majorCount >= 1 || minorCount >= 3) {
    return NextResponse.json({
      success: true,
      triggered: false,
      message: 'Daily limit reached',
    });
  }

  // Find eligible loot moments for this trigger
  const eligibleMoments = await prisma.lootMoment.findMany({
    where: {
      trigger: parsed.data.trigger,
      isActive: true,
    },
  });

  if (eligibleMoments.length === 0) {
    return NextResponse.json({
      success: true,
      triggered: false,
      message: 'No eligible loot moments',
    });
  }

  // RNG chance: 1-3% per major action (configurable)
  const chance = Math.random() * 100;
  const triggerChance = 2; // 2% default

  if (chance > triggerChance) {
    return NextResponse.json({
      success: true,
      triggered: false,
      message: 'No loot this time',
    });
  }

  // Pick random eligible moment (weighted by rarity if desired)
  let selectedMoment;
  const isMajorAvailable = majorCount < 1;
  
  if (isMajorAvailable) {
    // Can pick any moment
    const randomIndex = Math.floor(Math.random() * eligibleMoments.length);
    selectedMoment = eligibleMoments[randomIndex];
  } else {
    // Must pick minor rarity only
    const minorMoments = eligibleMoments.filter((m) => 
      ['common', 'rare'].includes(m.rarity)
    );
    if (minorMoments.length === 0) {
      return NextResponse.json({
        success: true,
        triggered: false,
        message: 'Daily limit reached',
      });
    }
    const minorIndex = Math.floor(Math.random() * minorMoments.length);
    selectedMoment = minorMoments[minorIndex];
  }

  // Create user loot moment
  const rewardData: any = {
    type: selectedMoment.rewardType,
    value: selectedMoment.rewardValue,
    rarity: selectedMoment.rarity,
    flavorText: selectedMoment.flavorText,
  };

  const userLoot = await prisma.userLootMoment.create({
    data: {
      userId: user.id,
      momentId: selectedMoment.id,
      rewardData,
      triggeredAt: new Date(),
    },
    include: {
      moment: true,
    },
  });

  // Log action
  await prisma.actionLog.create({
    data: {
      userId: user.id,
      action: 'loot_moment_triggered',
      metadata: {
        momentId: selectedMoment.id,
        trigger: parsed.data.trigger,
        rarity: selectedMoment.rarity,
      } as any,
    },
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    triggered: true,
    loot: {
      id: userLoot.id,
      rarity: selectedMoment.rarity,
      rewardType: selectedMoment.rewardType,
      rewardValue: selectedMoment.rewardValue,
      flavorText: selectedMoment.flavorText,
    },
  });
});

