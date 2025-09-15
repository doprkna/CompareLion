import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';

export async function GET() {
  const version = await prisma.version.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, version });
}
