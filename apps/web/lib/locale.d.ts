import { NextRequest } from 'next/server';
export type Lang = 'en' | 'cs';
export interface RequestLocale {
    lang: Lang;
    region: string;
}
export declare function getRequestLocale(req: NextRequest): Promise<RequestLocale>;
