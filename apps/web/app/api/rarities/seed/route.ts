import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

const BASE_RARITIES = [
  {
    key: 'common',
    name: 'Common',
    colorPrimary: '#9ca3af',
    colorGlow: null,
    frameStyle: 'solid',
    rankOrder: 1,
    description: 'Basic and readily available',
  },
  {
    key: 'uncommon',
    name: 'Uncommon',
    colorPrimary: '#10b981',
    colorGlow: '#10b98140',
    frameStyle: 'solid',
    rankOrder: 2,
    description: 'A bit harder to find',
  },
  {
    key: 'rare',
    name: 'Rare',
    colorPrimary: '#3b82f6',
    colorGlow: '#3b82f640',
    frameStyle: 'solid',
    rankOrder: 3,
    description: 'Uncommon and valuable',
  },
  {
    key: 'epic',
    name: 'Epic',
    colorPrimary: '#8b5cf6',
    colorGlow: '#8b5cf660',
    frameStyle: 'glow',
    rankOrder: 4,
    description: 'Powerful and impressive',
  },
  {
    key: 'legendary',
    name: 'Legendary',
    colorPrimary: '#f59e0b',
    colorGlow: '#f59e0b80',
    frameStyle: 'glow',
    rankOrder: 5,
    description: 'Extremely rare and prestigious',
  },
  {
    key: 'mythic',
    name: 'Mythic',
    colorPrimary: '#ef4444',
    colorGlow: '#ef4444a0',
    frameStyle: 'glow',
    rankOrder: 6,
    description: 'Mythical rarity, seen once per generation',
  },
  {
    key: 'eternal',
    name: 'Eternal',
    colorPrimary: '#ec4899',
    colorGlow: '#ec4899c0',
    frameStyle: 'glow',
    rankOrder: 7,
    description: 'Eternal and timeless, the ultimate rarity',
  },
];

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== 'ADMIN') return unauthorizedError('Admin only');

  const created = [];
  for (const rarity of BASE_RARITIES) {
    const tier = await prisma.rarityTier.upsert({
      where: { key: rarity.key },
      update: {
        name: rarity.name,
        colorPrimary: rarity.colorPrimary,
        colorGlow: rarity.colorGlow,
        frameStyle: rarity.frameStyle,
        rankOrder: rarity.rankOrder,
        description: rarity.description,
        isActive: true,
      },
      create: {
        ...rarity,
        isActive: true,
      },
    });
    created.push(tier);
  }

  return NextResponse.json({
    success: true,
    rarities: created,
    message: `Seeded ${created.length} rarity tiers`,
  });
});

