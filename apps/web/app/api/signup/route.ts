import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import bcrypt from 'bcrypt';
import { SignupSchema } from '@/lib/validation/auth';

function isValidEmail(email: string) {
  // Simple regex for email validation
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
  }
  const { username: email, password } = parsed.data;

  // treat username as email

  // Email format validated by Zod schema

  // Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { success: false, message: 'Email already registered.' },
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

  return NextResponse.json({ success: true, message: 'Signup successful.' });
}
