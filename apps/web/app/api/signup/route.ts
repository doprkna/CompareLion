import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import bcrypt from 'bcrypt';

function isValidEmail(email: string) {
  // Simple regex for email validation
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const email = username; // treat username as email

  if (!isValidEmail(email)) {
    return NextResponse.json({ success: false, message: 'Invalid email format.' }, { status: 400 });
  }

  // Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ success: false, message: 'Email already registered.' }, { status: 409 });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  await prisma.user.create({ data: { email, password: hashedPassword } });
  return NextResponse.json({ success: true, message: 'Signup successful.' });
}
