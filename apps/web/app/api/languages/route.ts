import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';

export async function GET() {
  const languages = await prisma.language.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ success: true, languages });
}
