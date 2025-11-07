import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError, notFoundError } from '@/lib/api-handler';

/**
 * GET /api/profile/[id]
 * Returns sanitized user profile based on visibility settings
 */
export const GET = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const currentUser = await getUserFromRequest(req);
  if (!currentUser) {
    return authError('Unauthorized');
  }

  const { id: targetUserId } = params;

  // Fetch target user with basic profile info
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      bio: true,
      visibility: true,
      level: true,
      xp: true,
      karmaScore: true,
      createdAt: true,
      showBadges: true,
      badgeType: true,
      archetype: true,
      equippedTitle: true,
      equippedIcon: true,
      equippedBackground: true,
      userBadges: {
        select: {
          badge: {
            select: {
              id: true,
              name: true,
              description: true,
              iconUrl: true,
              rarity: true,
            },
          },
          earnedAt: true,
        },
        orderBy: {
          earnedAt: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!targetUser) {
    return notFoundError('User');
  }

  // Determine what to show based on visibility
  const isSelf = currentUser.userId === targetUserId;
  const { visibility } = targetUser;

  // Check if users are friends (for FRIENDS visibility)
  let areFriends = false;
  if (!isSelf && visibility === 'FRIENDS') {
    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: currentUser.userId, friendId: targetUserId, status: 'accepted' },
          { userId: targetUserId, friendId: currentUser.userId, status: 'accepted' },
        ],
      },
    });
    areFriends = !!friendship;
  }

  // Build response based on visibility
  const canViewFull = isSelf || visibility === 'PUBLIC' || (visibility === 'FRIENDS' && areFriends);

  if (!canViewFull && visibility === 'PRIVATE') {
    // Private profile - only show minimal info
    return NextResponse.json({
      success: true,
      profile: {
        id: targetUser.id,
        username: targetUser.username,
        name: targetUser.name,
        avatarUrl: targetUser.avatarUrl,
        visibility: targetUser.visibility,
        isPrivate: true,
      },
    });
  }

  // Return sanitized profile
  const profile = {
    id: targetUser.id,
    username: targetUser.username,
    name: targetUser.name,
    avatarUrl: targetUser.avatarUrl,
    bio: targetUser.bio,
    visibility: targetUser.visibility,
    level: targetUser.level,
    xp: targetUser.xp,
    karmaScore: targetUser.karmaScore,
    archetype: targetUser.archetype,
    joinedAt: targetUser.createdAt,
    equippedTitle: targetUser.equippedTitle,
    equippedIcon: targetUser.equippedIcon,
    equippedBackground: targetUser.equippedBackground,
    badges: targetUser.showBadges
      ? targetUser.userBadges.map((ub) => ({
          id: ub.badge.id,
          name: ub.badge.name,
          description: ub.badge.description,
          iconUrl: ub.badge.iconUrl,
          rarity: ub.badge.rarity,
          earnedAt: ub.earnedAt,
        }))
      : [],
    isPrivate: false,
  };

  return NextResponse.json({
    success: true,
    profile,
  });
});

