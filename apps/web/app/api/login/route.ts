import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '7d';

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const email = username;

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
  }

  // Compare password hash
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
  }

  // Update lastLoginAt and lastActiveAt
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), lastActiveAt: new Date() },
  });

  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Set token as HTTP-only, Secure cookie
  const response = NextResponse.json({ success: true, message: 'Login successful.' });
  response.headers.set(
    'Set-Cookie',
    `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict; Secure`
  );
  return response;
}
