'use client';

import { useLocale } from '@/lib/i18n/useLocale';

export default function FooterLocaleToggle() {
  const { lang, region, locale, setLocale } = useLocale();

  function toggleLang() {
    setLocale({ lang: lang === 'en' ? 'cs' : 'en' });
  }

  function toggleRegion() {
    setLocale({ region: region === 'global' ? 'CZ' : 'global' });
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-xs text-slate-500">🌎 {locale}</span>
      <button
        className="rounded-md px-2 py-1 hover:bg-slate-100"
        onClick={toggleLang}
        aria-label="Toggle language"
      >
        {lang === 'cs' ? '🇨🇿 CZ' : '🇬🇧 EN'}
      </button>
      <button
        className="rounded-md px-2 py-1 hover:bg-slate-100"
        onClick={toggleRegion}
        aria-label="Toggle region"
      >
        {region}
      </button>
    </div>
  );
}


