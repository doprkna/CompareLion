'use client';

import { useLocale, type Lang } from '@/lib/i18n/useLocale';
import { Globe } from 'lucide-react';

const LANGUAGES: { code: Lang; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'cs', name: 'Čeština' },
];

const REGIONS = [
  { code: 'global', label: 'Global' },
  { code: 'CZ', label: 'Czech Republic' },
];

/** Language & region preferences for Profile → Settings. */
export function ProfileLanguageSettings() {
  const { lang, region, locale, setLocale } = useLocale();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="profile-lang" className="text-sm font-medium text-text">
          Language
        </label>
      </div>
      <select
        id="profile-lang"
        className="w-full max-w-xs bg-card border border-border rounded px-3 py-2 text-sm text-text"
        value={lang}
        onChange={(e) => setLocale({ lang: e.target.value as Lang })}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>

      <div>
        <label htmlFor="profile-region" className="text-sm font-medium text-text block mb-2">
          Region
        </label>
        <select
          id="profile-region"
          className="w-full max-w-xs bg-card border border-border rounded px-3 py-2 text-sm text-text"
          value={region}
          onChange={(e) => setLocale({ region: e.target.value })}
        >
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-subtle flex items-center gap-1.5">
        <Globe className="h-3.5 w-3.5" />
        Active locale: {locale}
      </p>
    </div>
  );
}
