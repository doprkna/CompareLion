import { NextRequest, NextResponse } from 'next/server';
import { SignupSchema } from '@/lib/validation/auth';
import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const COOKIE_NAME = 'session';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
    }

    const passwordHash = await hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, path: '/' });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Signup failed' }, { status: 500 });
  }
}
