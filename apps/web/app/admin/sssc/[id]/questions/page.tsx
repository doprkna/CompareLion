"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Toast from '@radix-ui/react-toast';

type Question = {
  id: string;
  text: string;
  difficulty?: string | null;
  approved: boolean;
  reviewNotes?: string | null;
  createdAt: string;
};
type Counts = { total: number; approved: number; unapproved: number };

export default function AdminQuestionsPage() {
  const router = useRouter();
  const { id } = router.getParams() as { id?: string };
  const ssscId = id || '';
  const [filter, setFilter] = useState<'all' | 'approved' | 'unapproved'>('unapproved');
  const [rows, setRows] = useState<Question[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<Array<{ id: string; title: string }>>([]);
  const [showDupes, setShowDupes] = useState(false);
  const [dupes, setDupes] = useState<Array<{ normalizedText: string; ids: string[] }>>([]);

  async function load() {
    if (!ssscId) return;
    const r = await fetch(`/api/admin/questions?ssscId=${encodeURIComponent(ssscId)}&approved=${filter}`);
    const data = await r.json();
    setRows(data.items);
    setCounts(data.counts);
    setSelected({});
  }

  useEffect(() => {
    load();
  }, [ssscId, filter]);

  async function saveRow(id: string, patch: Partial<Question>) {
    await fetch(`/api/admin/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setToasts(ts => [...ts, { id: `save-${id}-${Date.now()}`, title: 'Question saved' }]);
    load();
  }

  async function bulkApprove() {
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (!ids.length) return;
    await fetch('/api/admin/questions/bulk-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    setToasts(ts => [...ts, { id: `bulk-${Date.now()}`, title: 'Bulk approved' }]);
    load();
  }

  return (
    <Toast.Provider>
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Questions · Leaf {ssscId}</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm opacity-70">
            {counts ? `Total ${counts.total} · Approved ${counts.approved} · Unapproved ${counts.unapproved}` : '…'}
          </span>
          <select
            className="border rounded px-2 py-1"
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
          >
            <option value="unapproved">Unapproved</option>
            <option value="approved">Approved</option>
            <option value="all">All</option>
          </select>
          <button className="border rounded px-3 py-1" onClick={bulkApprove}>
            Bulk approve selected
          </button>
        </div>

        <div className="border p-4">
          <button
            className="px-2 py-1 bg-gray-200 rounded"
            onClick={async () => {
              setShowDupes(!showDupes);
              if (!showDupes) {
                const r = await fetch(`/api/admin/questions/dupes?ssscId=${ssscId}`);
                const data = await r.json();
                setDupes(data.dupes);
              }
            }}
          >
            {showDupes ? 'Hide Dupes' : 'Show Dupes'}
          </button>
          {showDupes && (
            <div className="mt-2 text-sm">
              {dupes.length === 0 && <p>No duplicates found.</p>}
              {dupes.map(d => (
                <div key={d.normalizedText} className="mb-2">
                  <div className="font-semibold">{d.normalizedText}</div>
                  <div>IDs: {d.ids.join(', ')}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">
                <input
                  type="checkbox"
                  onChange={e => {
                    const v = e.target.checked;
                    setSelected(Object.fromEntries(rows.map(r => [r.id, v])));
                  }}
                />
              </th>
              <th>Text</th>
              <th>Difficulty</th>
              <th>Approved</th>
              <th>Save</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <Row
                key={r.id}
                row={r}
                onSave={saveRow}
                selected={!!selected[r.id]}
                onSelect={v => setSelected(s => ({ ...s, [r.id]: v }))}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2" />
      {toasts.map(t => (
        <Toast.Root key={t.id} duration={3000} onOpenChange={open => { if (!open) setToasts(ts => ts.filter(x => x.id !== t.id)); }}>
          <Toast.Title>{t.title}</Toast.Title>
        </Toast.Root>
      ))}
    </Toast.Provider>
  );
}

function Row({
  row,
  onSave,
  selected,
  onSelect,
}: {
  row: Question;
  onSave: (id: string, patch: Partial<Question>) => void;
  selected: boolean;
  onSelect: (v: boolean) => void;
}) {
  const [text, setText] = useState(row.text);
  const maxLen = 240;
  const [difficulty, setDifficulty] = useState(row.difficulty ?? 'medium');
  const [approved, setApproved] = useState(row.approved);

  const dirty =
    text !== row.text ||
    difficulty !== (row.difficulty ?? 'medium') ||
    approved !== row.approved;

  return (
    <tr className="border-b align-top">
      <td className="py-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelect(e.target.checked)}
        />
      </td>
      <td className="py-2">
        <textarea
          className="w-full border rounded p-2"
          rows={2}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="text-xs text-gray-500">{text.length}/{maxLen}</div>
      </td>
      <td className="py-2">
        <select
          className="border rounded px-2 py-1"
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
        >
          <option>easy</option>
          <option>medium</option>
          <option>hard</option>
        </select>
      </td>
      <td className="py-2">
        <input
          type="checkbox"
          checked={approved}
          onChange={e => setApproved(e.target.checked)}
        />
      </td>
      <td className="py-2">
        <button
          className={`px-3 py-1 rounded ${dirty ? 'bg-black text-white' : 'bg-gray-200'}`}
          disabled={!dirty}
          onClick={() => onSave(row.id, { text, difficulty, approved })}
        >
          Save
        </button>
      </td>
    </tr>
  );
}
