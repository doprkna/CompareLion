import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse } from '@/lib/api-handler';

export const GET = safeAsync(async (_request: NextRequest) => {
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

  return successResponse({
    adminUser,
    userCount,
    allUsers,
    message: adminUser ? 'Admin user found!' : 'Admin user NOT found!'
  });
});

