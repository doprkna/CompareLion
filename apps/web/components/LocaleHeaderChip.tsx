'use client';

import { useLocale } from '@/lib/i18n/useLocale';

export default function LocaleHeaderChip() {
  const { lang, region } = useLocale();
  return (
    <div className="w-full border-b bg-background">
      <div className="max-w-6xl mx-auto px-4 py-2 text-xs text-muted-foreground">
        Locale: <span className="font-medium">{lang.toUpperCase()} / {region}</span>
      </div>
    </div>
  );
}
