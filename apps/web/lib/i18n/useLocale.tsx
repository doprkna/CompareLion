'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'en' | 'cs';

export interface LocaleState {
  lang: Lang;
  region: string; // 'global' | 'CZ' | ...
  locale: string; // e.g., 'en-US', 'cs-CZ'
}

interface LocaleContextValue extends LocaleState {
  setLocale: (next: Partial<LocaleState>) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = 'parel.locale.v1';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LocaleState>(() => {
    if (typeof window === 'undefined') return { lang: 'en', region: 'global', locale: 'en-US' };
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as LocaleState;
    } catch {}
    return { lang: 'en', region: 'global', locale: 'en-US' };
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const setLocale = useCallback((next: Partial<LocaleState>) => {
    setState(prev => {
      const merged = { ...prev, ...next } as LocaleState;
      // If only lang toggled, infer common region mapping
      if (next.lang && !next.locale) {
        merged.locale = next.lang === 'cs' ? 'cs-CZ' : 'en-US';
      }
      // If only region toggled, adjust locale if consistent with lang
      if (next.region && !next.locale) {
        if (merged.lang === 'cs') merged.locale = 'cs-CZ';
        else merged.locale = 'en-US';
      }
      return merged;
    });
  }, []);

  const value = useMemo<LocaleContextValue>(() => ({ ...state, setLocale }), [state, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}


