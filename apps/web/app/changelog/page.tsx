"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ChangelogPage() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/changelog')
      .then(data => {
        if (data.success) setEntries(data.entries);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Changelog</h1>
        {!entries.length ? (
          <p>Loading...</p>
        ) : (
          entries.map((e, idx) => (
            <div key={idx} className="mb-6">
              <h2 className="text-xl font-semibold mb-1">{e.version} {e.date ? `- ${e.date}` : ''}</h2>
              {['added','changed','fixed'].map((section) => {
                const items = e[section as 'added' | 'changed' | 'fixed'];
                if (!items.length) return null;
                return (
                  <div key={section} className="mt-2">
                    <h3 className="font-medium capitalize">{section}</h3>
                    <ul className="list-disc list-inside">
                      {items.map((it: { text: string; children: string[] }, i: number) => (
                        <li key={i} className="mb-1">
                          {it.text}
                          {it.children.length > 0 && (
                            <ul className="list-circle list-inside ml-4 mt-1">
                              {it.children.map((child, ci) => (
                                <li key={ci} className="text-sm text-gray-600">{child}</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
