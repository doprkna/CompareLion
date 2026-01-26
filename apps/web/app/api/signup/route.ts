import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import bcrypt from 'bcrypt';
import { SignupSchema } from '@parel/validation/auth';
import { safeAsync, validationError } from '@/lib/api-handler';

function _isValidEmail(email: string) {
  // Simple regex for email validation
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export const POST = safeAsync(async (request: NextRequest) => {
  const body = await request.json();
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('Invalid input data', parsed.error.format());
  }
  const { username: email, password } = parsed.data;

  // treat username as email

  // Email format validated by Zod schema

  // Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { success: false, error: 'Email already registered.', timestamp: new Date().toISOString() },
      { status: 409 }
    );
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  // Create user
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword, // can be null if no password
    },
  });

  return NextResponse.json({ success: true, message: 'Signup successful.', timestamp: new Date().toISOString() });
});
