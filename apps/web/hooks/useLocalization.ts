/**
 * Localization Hook
 * v0.23.0 - Phase G: Auto-detect language and region
 * 
 * Usage:
 * const { lang, region, setLang, setRegion } = useLocalization();
 */

'use client';

import { useState, useEffect } from 'react';

export interface LocalizationState {
  lang: string;
  region: string;
}

const STORAGE_KEY = 'parel_localization';
const DEFAULT_LANG = 'en';
const DEFAULT_REGION = 'GLOBAL';

/**
 * Region detection from browser language
 * Maps common locales to region codes
 */
function detectRegionFromBrowser(): string {
  if (typeof window === 'undefined') return DEFAULT_REGION;
  
  const locale = navigator.language || (navigator as any).userLanguage;
  
  // Map common locale codes to regions
  const regionMap: Record<string, string> = {
    'cs': 'EU-CZ',
    'cs-CZ': 'EU-CZ',
    'pl': 'EU-PL',
    'pl-PL': 'EU-PL',
    'sk': 'EU-SK',
    'sk-SK': 'EU-SK',
    'de': 'EU-DE',
    'de-DE': 'EU-DE',
    'fr': 'EU-FR',
    'fr-FR': 'EU-FR',
    'en-US': 'US',
    'en-GB': 'EU-GB',
  };
  
  return regionMap[locale] || DEFAULT_REGION;
}

/**
 * Language detection from browser
 */
function detectLanguageFromBrowser(): string {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  
  const locale = navigator.language || (navigator as any).userLanguage;
  const lang = locale.slice(0, 2);
  
  // Supported languages
  const supported = ['en', 'cs'];
  return supported.includes(lang) ? lang : DEFAULT_LANG;
}

/**
 * Load localization from localStorage or auto-detect
 */
function loadLocalization(): LocalizationState {
  if (typeof window === 'undefined') {
    return { lang: DEFAULT_LANG, region: DEFAULT_REGION };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load localization from storage:', e);
  }
  
  // Auto-detect
  return {
    lang: detectLanguageFromBrowser(),
    region: detectRegionFromBrowser(),
  };
}

/**
 * Save localization to localStorage
 */
function saveLocalization(state: LocalizationState) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save localization to storage:', e);
  }
}

/**
 * Hook for managing user localization preferences
 */
export function useLocalization() {
  const [state, setState] = useState<LocalizationState>({
    lang: DEFAULT_LANG,
    region: DEFAULT_REGION,
  });
  
  const [isClient, setIsClient] = useState(false);
  
  // Load on mount (client-side only)
  useEffect(() => {
    setIsClient(true);
    const loaded = loadLocalization();
    setState(loaded);
  }, []);
  
  // Update language
  const setLang = (lang: string) => {
    const newState = { ...state, lang };
    setState(newState);
    saveLocalization(newState);
  };
  
  // Update region
  const setRegion = (region: string) => {
    const newState = { ...state, region };
    setState(newState);
    saveLocalization(newState);
  };
  
  // Update both
  const setLocalization = (lang: string, region: string) => {
    const newState = { lang, region };
    setState(newState);
    saveLocalization(newState);
  };
  
  // Get query params for API calls
  const getQueryParams = () => {
    return new URLSearchParams({
      lang: state.lang,
      region: state.region,
    });
  };
  
  return {
    lang: state.lang,
    region: state.region,
    setLang,
    setRegion,
    setLocalization,
    getQueryParams,
    isClient, // False during SSR, true after hydration
  };
}

/**
 * Helper to build API URL with localization params
 */
export function withLocalization(baseUrl: string, lang: string, region: string): string {
  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set('lang', lang);
  url.searchParams.set('region', region);
  return url.toString();
}

