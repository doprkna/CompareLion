import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const body = await req.json();
  
  // Test database connection
  const userCount = await prisma.user.count();
  
  // Test finding a user
  const user = await prisma.user.findUnique({
    where: { email: body.email || 'demo@example.com' },
    select: {
      id: true,
      email: true,
      passwordHash: true,
    }
  });
  
  return successResponse({
    message: 'Test login route working',
    userCount,
    userFound: !!user,
    user: user ? {
      id: user.id,
      email: user.email,
      hasPassword: !!user.passwordHash
    } : null
  });
});
