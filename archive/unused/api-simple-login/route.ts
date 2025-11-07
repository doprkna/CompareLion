import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { safeAsync, successResponse, errorResponse, authError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const body = await req.json();
  const { email, password } = body;
  
  if (!email || !password) {
    return errorResponse('Email and password are required', 400, 'VALIDATION_ERROR');
  }
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
    }
  });
  
  if (!user) {
    return authError('Invalid credentials');
  }
  
  if (!user.password) {
    return authError('No password set for this account');
  }
  
  // Verify password with bcrypt
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return authError('Invalid credentials');
  }
  
  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });
  
  return successResponse(
    { userId: user.id },
    'Login successful'
  );
});
