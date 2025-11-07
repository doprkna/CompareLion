import { NextRequest } from 'next/server';
import { getAllLanguages } from '@/lib/services/languageService';
import { toLanguageDTO, LanguageDTO } from '@/lib/dto/languageDTO';
import { safeAsync, successResponse } from '@/lib/api-handler';

export const GET = safeAsync(async (_req: NextRequest) => {
  if (!process.env.DATABASE_URL) {
    return successResponse({ languages: [] });
  }

  // Fetch via service layer
  const raw = await getAllLanguages();
  const languages: LanguageDTO[] = raw.map(toLanguageDTO);
  return successResponse({ languages });
});
