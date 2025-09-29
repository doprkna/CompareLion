import { NextResponse } from 'next/server';
import { getAllLanguages } from '@/lib/services/languageService';
import { toLanguageDTO, LanguageDTO } from '@/lib/dto/languageDTO';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, languages: [] });
  }

  // Fetch via service layer
  const raw = await getAllLanguages();
  const languages: LanguageDTO[] = raw.map(toLanguageDTO);
  return NextResponse.json({ success: true, languages });
}
