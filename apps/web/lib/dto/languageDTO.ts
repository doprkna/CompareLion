import type { Language as PrismaLanguage } from '@parel/db/src/client';

export function toLanguageDTO(lang: PrismaLanguage): {
  code: string;
  label: string;
  isDefault: boolean;
} {
  return {
    code: lang.code,
    label: lang.name,
    isDefault: lang.code === process.env.DEFAULT_LANGUAGE,
  };
}

export type LanguageDTO = ReturnType<typeof toLanguageDTO>;
