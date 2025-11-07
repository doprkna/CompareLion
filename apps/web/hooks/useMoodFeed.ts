import { useCallback, useEffect, useState } from 'react';

type MoodKey = 'chill' | 'deep' | 'roast';

const DEFAULTS = {
  chill: { bgAccent: '#0f172a', toast: 'soft', anim: 0.3 },
  deep:  { bgAccent: '#111827', toast: 'calm', anim: 0.2 },
  roast: { bgAccent: '#1f2937', toast: 'spicy', anim: 0.5 },
};

export function useMoodFeed() {
  const [mood, setMoodState] = useState<MoodKey>('chill');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('moodFeed') as MoodKey | null;
    if (stored) setMoodState(stored);
  }, []);

  const setMood = useCallback(async (m: MoodKey) => {
    setMoodState(m);
    localStorage.setItem('moodFeed', m);
    // persist async (rate-limit via debounce in UI ideally)
    setSaving(true);
    try { await fetch('/api/user/settings/mood', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moodKey: m }) }); } catch {}
    setSaving(false);
  }, []);

  const applyTone = useCallback((text: string, variant: 'short'|'long' = 'short') => {
    if (mood === 'chill') return text;
    if (mood === 'deep') return variant === 'short' ? `… ${text}` : `${text}\nTake a breath and reflect.`;
    if (mood === 'roast') return variant === 'short' ? `${text} 😏` : `${text}\nTry harder next time.`;
    return text;
  }, [mood]);

  const tokens = DEFAULTS[mood];
  return { mood, setMood, applyTone, tokens, saving };
}


