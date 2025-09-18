"use client";

import React, { useEffect, useState } from 'react';

export default function MainPage() {
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch('/api/changelog')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.entries?.length) {
          setChanges(data.entries);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Main</h1>
        <p className="text-gray-600 mb-6">This is a placeholder for the main dashboard/home page after login.</p>
        <div className="border rounded p-4 mb-4">
          <h2 className="font-semibold mb-2">Latest Changes</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-500">Changelog unavailable</p>
          ) : changes.length === 0 ? (
            <p className="text-sm text-gray-500">No changelog found</p>
          ) : (
            <>
              <div className="mb-2 text-sm text-gray-700">
                <strong>{changes[0].version}</strong>{changes[0].date ? ` - ${changes[0].date}` : ''}
              </div>
              {(['added', 'changed', 'fixed'] as const).map((section) => {
                const items = changes[0][section];
                if (!items || items.length === 0) return null;
                return (
                  <div key={section} className="mb-2">
                    <h3 className="font-medium capitalize mb-1">{section}</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {items.map((it: { text: string; children: string[] }, i: number) => (
                        <li key={i} className="mb-1">
                          {it.text}
                          {it.children.length > 0 && (
                            <ul className="list-circle list-inside ml-4 mt-1">
                              {it.children.map((child, ci) => (
                                <li key={ci} className="text-sm text-gray-600 mb-1">{child}</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              <a href="/changelog" className="text-blue-600 hover:underline text-sm">See all changes</a>
            </>
          )}
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">News</h2>
          <p className="text-sm text-gray-500">[TODO: News modal/section]</p>
        </div>
      </div>
    </div>
  );
}
