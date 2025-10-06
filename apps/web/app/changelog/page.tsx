"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { ChangelogProse } from '@/components/ui/prose';

export default function ChangelogPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/changelog')
      .then(data => {
        console.log('Changelog API response:', data); // Debug log
        if (data.success) {
          setEntries(data.entries || []);
        } else {
          setError(data.error || 'Failed to load changelog');
        }
      })
      .catch(err => {
        console.error('Changelog fetch error:', err);
        setError('Failed to load changelog');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Changelog</h1>
        
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : error ? (
          <div className="text-red-600">
            <p>Error: {error}</p>
            <p className="text-sm mt-2">Please try refreshing the page.</p>
          </div>
        ) : entries.length === 0 ? (
          <p className="text-gray-600">No changelog entries found.</p>
        ) : (
          entries.map((e, idx) => (
            <details key={e.version} open={idx === 0} className="mb-6">
              <summary className="cursor-pointer font-semibold text-xl text-gray-900 hover:text-blue-600">
                {e.version} {e.date ? `- ${e.date}` : ''}
              </summary>
              <ChangelogProse>
                {['added', 'changed', 'fixed'].map((section) => {
                  const items = e[section as 'added' | 'changed' | 'fixed'];
                  if (!items || !items.length) return null;
                  return (
                    <div key={section} className="mt-2">
                      <h3 className="font-medium capitalize text-gray-800">{section}</h3>
                      <ul className="list-disc list-inside text-gray-700">
                        {items.map((it: { text: string; children: string[] }, i: number) => (
                          <li key={i} className="mb-1">
                            {it.text}
                            {it.children && it.children.length > 0 && (
                              <ul className="list-circle list-inside ml-4 mt-1 text-gray-600">
                                {it.children.map((child, ci) => (
                                  <li key={ci} className="text-sm">{child}</li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </ChangelogProse>
            </details>
          ))
        )}
      </div>
    </div>
  );
}
