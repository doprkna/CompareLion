'use client';

import { useLocale, type Lang } from '@/lib/i18n/useLocale';

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'cs', label: 'CZ' },
];

/** Single locale control for the top navigation bar. */
export function NavLocaleSelector() {
  const { lang, region, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <select
        className="bg-card border border-border rounded px-2 py-1 text-xs text-text"
        value={lang}
        onChange={(e) => setLocale({ lang: e.target.value as Lang })}
        aria-label="Language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="bg-card border border-border rounded px-2 py-1 text-xs text-subtle hover:text-text transition-colors"
        onClick={() =>
          setLocale({ region: region === 'global' ? 'CZ' : 'global' })
        }
        aria-label="Toggle region"
        title={`Region: ${region}`}
      >
        {region === 'global' ? '🌐' : region}
      </button>
    </div>
  );
}
