import type { Language as PrismaLanguage } from '@parel/db';
export declare function toLanguageDTO(lang: PrismaLanguage): {
    code: string;
    label: string;
    isDefault: boolean;
};
export type LanguageDTO = ReturnType<typeof toLanguageDTO>;
