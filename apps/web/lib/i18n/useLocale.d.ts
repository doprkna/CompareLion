import React from 'react';
export type Lang = 'en' | 'cs';
export interface LocaleState {
    lang: Lang;
    region: string;
    locale: string;
}
interface LocaleContextValue extends LocaleState {
    setLocale: (next: Partial<LocaleState>) => void;
}
export declare function LocaleProvider({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export declare function useLocale(): LocaleContextValue;
export {};
