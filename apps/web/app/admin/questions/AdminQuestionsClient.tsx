'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/apiBase';

interface FlowQuestionItem {
  id: string;
  text: string;
  type: string;
  categoryId: string | null;
  categoryName: string | null;
  tags: string[];
  createdAt: string;
}

export function AdminQuestionsClient() {
  const [items, setItems] = useState<FlowQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTags, setEditTags] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await apiFetch('/api/admin/flow-questions');
      const data = (res as { data?: { items?: FlowQuestionItem[] } })?.data;
      if (data?.items) setItems(data.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (q: FlowQuestionItem) => {
    setEditingId(q.id);
    setEditTags(q.tags?.join(', ') || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTags('');
  };

  const saveTags = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const tags = editTags
        .split(/[,\s]+/)
        .map((t) => t.trim())
        .filter(Boolean);
      await apiFetch(`/api/admin/flow-questions/${editingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ tags }),
      });
      setItems((prev) =>
        prev.map((q) => (q.id === editingId ? { ...q, tags } : q))
      );
      cancelEdit();
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <span className="text-subtle">Loading questions…</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Flow Questions & Tags</h1>
        <Link href="/admin" className="text-accent hover:underline text-sm">
          ← Admin
        </Link>
      </div>
      <p className="text-subtle text-sm">
        View and edit tags on questions. Tags: lowercase, short, single concept (e.g. ghost, career, money).
      </p>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-subtle">No questions found.</p>
        ) : (
          items.map((q) => (
            <div
              key={q.id}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-text font-medium truncate">{q.text}</p>
                  <p className="text-subtle text-xs mt-1">
                    {q.categoryName || '—'} · {q.type}
                  </p>
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  {editingId === q.id ? (
                    <>
                      <input
                        type="text"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="ghost, paranormal, supernatural"
                        className="px-2 py-1 text-sm border border-border rounded bg-bg w-48"
                      />
                      <button
                        onClick={saveTags}
                        disabled={saving}
                        className="px-3 py-1 text-sm bg-accent text-white rounded hover:opacity-90 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="px-3 py-1 text-sm border border-border rounded hover:bg-bg"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-subtle flex flex-wrap gap-1 max-w-[200px]">
                        {q.tags?.length ? (
                          q.tags.map((t) => (
                            <span
                              key={t}
                              className="bg-bg px-1.5 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="italic">no tags</span>
                        )}
                      </span>
                      <button
                        onClick={() => startEdit(q)}
                        className="px-2 py-1 text-xs text-accent hover:underline"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
