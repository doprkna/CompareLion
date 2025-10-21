import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        xp: true,
        passwordHash: true,
      }
    });

    // Get total user count
    const userCount = await prisma.user.count();

    // Get all users (first 5)
    const allUsers = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    return NextResponse.json({
      success: true,
      adminUser,
      userCount,
      allUsers,
      message: adminUser ? 'Admin user found!' : 'Admin user NOT found!'
    });
  } catch (error) {
    console.error('[API] Error checking users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check users' },
      { status: 500 }
    );
  }
}

