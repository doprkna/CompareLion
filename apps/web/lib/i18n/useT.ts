'use client';

import { useLocale } from './useLocale';
import en from './locales/en.ts';
import cs from './locales/cs.ts';

type Dict = Record<string, string>;

const DICTS: Record<string, Dict> = {
  en,
  cs,
};

export function useT() {
  const { lang } = useLocale();
  const dict = (DICTS[lang] || en) as Dict;
  return (key: string, fallback?: string) => {
    return dict[key] ?? fallback ?? key;
  };
}


