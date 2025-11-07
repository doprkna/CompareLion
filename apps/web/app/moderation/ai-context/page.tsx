'use client';

import { useEffect, useMemo, useState } from 'react';

type AIContext = {
  region: string;
  localeCode: string;
  toneProfile?: string | null;
  culturalNotes?: string | null;
  humorStyle?: string | null;
  tabooTopics?: string[] | null;
};

function toCsv(list?: string[] | null) {
  return (list || []).join(', ');
}

function fromCsv(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AIContextAdminPage() {
  const [region, setRegion] = useState('GLOBAL');
  const [localeCode, setLocaleCode] = useState('en-US');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ctx, setCtx] = useState<AIContext | null>(null);
  const [toneProfile, setToneProfile] = useState('');
  const [culturalNotes, setCulturalNotes] = useState('');
  const [humorStyle, setHumorStyle] = useState('');
  const [tabooCsv, setTabooCsv] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const notesLen = useMemo(() => culturalNotes.length, [culturalNotes]);

  async function loadContext() {
    setLoading(true);
    setMessage(null);
    try {
      const url = new URL('/api/ai/context', window.location.origin);
      url.searchParams.set('region', region);
      const res = await fetch(url.toString(), { method: 'GET' });
      const json = await res.json();
      const data = (json.context || null) as AIContext | null;
      if (data) {
        setCtx(data);
        setLocaleCode(data.localeCode || localeCode);
        setToneProfile(data.toneProfile || '');
        setCulturalNotes(data.culturalNotes || '');
        setHumorStyle(data.humorStyle || '');
        setTabooCsv(toCsv(data.tabooTopics));
      } else {
        setCtx(null);
      }
    } catch (e) {
      setMessage('Failed to load context');
    } finally {
      setLoading(false);
    }
  }

  async function saveContext() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/ai/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region,
          localeCode,
          toneProfile: toneProfile || null,
          culturalNotes: culturalNotes || null,
          humorStyle: humorStyle || null,
          tabooTopics: fromCsv(tabooCsv),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || 'Save failed');
      }
      setMessage('Saved');
      await loadContext();
    } catch (e: any) {
      setMessage(e?.message || 'Failed to save context');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    // initial load
    loadContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">AI Regional Contexts</h1>
      <p className="text-sm text-muted-foreground">Edit per-region/locale cultural tone for AI features.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Region</label>
          <input className="w-full border rounded px-3 py-2" value={region} onChange={(e) => setRegion(e.target.value.toUpperCase())} placeholder="e.g. CZ or GLOBAL" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Locale Code</label>
          <input className="w-full border rounded px-3 py-2" value={localeCode} onChange={(e) => setLocaleCode(e.target.value)} placeholder="e.g. cs-CZ" />
        </div>
        <div className="flex items-end gap-2">
          <button className="border rounded px-3 py-2" onClick={loadContext} disabled={loading}>
            {loading ? 'Loading…' : 'Load'}
          </button>
          <button className="border rounded px-3 py-2" onClick={saveContext} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left border">Region</th>
              <th className="p-2 text-left border">Locale</th>
              <th className="p-2 text-left border">Tone Profile</th>
              <th className="p-2 text-left border">Humor Style</th>
              <th className="p-2 text-left border">Taboo Topics (CSV)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border align-top">
                <code>{region}</code>
              </td>
              <td className="p-2 border align-top">
                <code>{localeCode}</code>
              </td>
              <td className="p-2 border">
                <input className="w-full border rounded px-2 py-1" value={toneProfile} onChange={(e) => setToneProfile(e.target.value)} placeholder="e.g. friendly" />
              </td>
              <td className="p-2 border">
                <input className="w-full border rounded px-2 py-1" value={humorStyle} onChange={(e) => setHumorStyle(e.target.value)} placeholder="e.g. dry sarcasm" />
              </td>
              <td className="p-2 border">
                <input className="w-full border rounded px-2 py-1" value={tabooCsv} onChange={(e) => setTabooCsv(e.target.value)} placeholder="comma separated" />
              </td>
            </tr>
            <tr>
              <td className="p-2 border font-medium" colSpan={1}>Cultural Notes</td>
              <td className="p-2 border" colSpan={4}>
                <textarea
                  className="w-full border rounded px-2 py-1 h-28"
                  value={culturalNotes}
                  onChange={(e) => setCulturalNotes(e.target.value)}
                  placeholder="Guidance for tone and sensitive areas"
                />
                <div className="text-xs text-muted-foreground mt-1">{notesLen}/1000</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {message && <div className="text-sm">{message}</div>}
    </div>
  );
}


