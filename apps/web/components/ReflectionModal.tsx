'use client';

import { useState } from 'react';

export function ReflectionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function submit() {
    if (text.trim().length < 3) {
      setError('Please write at least 3 characters');
      return;
    }
    if (text.trim().length > 200) {
      setError('Max 200 characters');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to save');
      onClose();
      setText('');
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white text-black rounded shadow-lg w-full max-w-md p-4">
        <div className="text-lg font-semibold mb-2">💬 What did you learn today?</div>
        <textarea
          className="w-full border rounded p-2 h-28"
          maxLength={200}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a short reflection (≤ 200 chars)"
        />
        <div className="text-xs text-gray-600 mt-1">{text.length}/200</div>
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        <div className="mt-3 flex justify-end gap-2">
          <button className="border rounded px-3 py-1" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="border rounded px-3 py-1" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}


