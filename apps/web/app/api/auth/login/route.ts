import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema } from '@/lib/validation/auth';
import { compare } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const COOKIE_NAME = 'session';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, path: '/' });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
