"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LocalesEditorPage() {
  const [activeLang, setActiveLang] = useState('cs');
  const [basePack, setBasePack] = useState<any>(null); // en
  const [targetPack, setTargetPack] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [enRes, langRes] = await Promise.all([
          fetch('/api/i18n?lang=en', { cache: 'no-store' }).then(r => r.json()),
          fetch(`/api/i18n?lang=${encodeURIComponent(activeLang)}`, { cache: 'no-store' }).then(r => r.json()),
        ]);
        if (!mounted) return;
        setBasePack(enRes.pack || {});
        setTargetPack(langRes.pack || {});
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [activeLang]);

  const missingKeys = useMemo(() => {
    if (!basePack || !targetPack) return [] as string[];
    const keys = Object.keys(basePack).filter(k => k !== 'meta');
    const missing: string[] = [];
    for (const k of keys) {
      if (!(k in targetPack)) missing.push(k);
    }
    return missing;
  }, [basePack, targetPack]);

  const handleSuggest = async (key: string, value: string) => {
    setSuggesting(key);
    try {
      const res = await fetch('/api/i18n/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: activeLang, key, suggested: value }),
      });
      const j = await res.json();
      // noop: optimistic UI could append suggestion list; keep minimal
    } finally {
      setSuggesting(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Locales Editor</CardTitle>
          <div className="flex items-center gap-2">
            <label className="text-sm">Active language</label>
            <select value={activeLang} onChange={(e) => setActiveLang(e.target.value)} className="h-9 border rounded px-2">
              <option value="cs">cs</option>
              <option value="es">es</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-sm text-slate-600">Loading...</div>}
          {!loading && (
            <div className="space-y-4">
              <div className="text-sm text-slate-700">Missing keys for <b>{activeLang}</b>: {missingKeys.length}</div>
              <div className="space-y-3">
                {missingKeys.map((k) => (
                  <div key={k} className="flex items-center gap-2">
                    <div className="flex-1 text-xs">
                      <div className="font-mono text-slate-600">{k}</div>
                      <div className="text-slate-500">EN: {String(basePack?.[k] ?? '')}</div>
                    </div>
                    <form
                      className="flex items-center gap-2"
                      onSubmit={(e: any) => {
                        e.preventDefault();
                        const value = (e.currentTarget.elements.namedItem('v') as HTMLInputElement).value;
                        handleSuggest(k, value);
                        e.currentTarget.reset();
                      }}
                    >
                      <input name="v" className="h-8 border rounded px-2 text-xs" placeholder="Your suggestion" />
                      <Button type="submit" size="sm" disabled={suggesting === k}>{suggesting === k ? '...' : 'Suggest'}</Button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


