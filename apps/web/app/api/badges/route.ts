import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthedUser } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthedUser();
    
    // Get all badges with user's earned badges
    const badges = await prisma.badge.findMany({
      where: { active: true },
      include: {
        userBadges: {
          where: { userId: user.id },
          select: { createdAt: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Transform to include earned status
    const userBadges = badges.map(badge => ({
      id: badge.id,
      slug: badge.slug,
      title: badge.title,
      description: badge.description,
      icon: badge.icon,
      earned: badge.userBadges.length > 0,
      earnedAt: badge.userBadges[0]?.createdAt || null
    }));

    return NextResponse.json({ 
      success: true, 
      badges: userBadges 
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}
