import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { toLanguageDTO, LanguageDTO } from '@/lib/dto/languageDTO';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, languages: [] });
  }

  const raw = await prisma.language.findMany();
  const languages: LanguageDTO[] = raw.map(toLanguageDTO);
  return NextResponse.json({ success: true, languages });
}
