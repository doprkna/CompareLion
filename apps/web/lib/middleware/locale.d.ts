import { NextRequest } from 'next/server';
export type LocaleCode = string;
export declare function resolveLocaleChain(locale: string): LocaleCode[];
export declare function getRequestLocaleChain(req: NextRequest): Promise<LocaleCode[]>;
export declare function sortByLocalePreference<T extends {
    localeCode?: string | null;
}>(items: T[], chain: LocaleCode[]): T[];
