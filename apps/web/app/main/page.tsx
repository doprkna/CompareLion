"use client";

import React, { useEffect, useState } from 'react';

export default function MainPage() {
  const [changes, setChanges] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/changelog')
      .then(res => res.json())
      .then(data => {
        if (data.success) setChanges(data.entries.slice(0, 3));
      });
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Main</h1>
        <p className="text-gray-600 mb-6">This is a placeholder for the main dashboard/home page after login.</p>
        <div className="border rounded p-4 mb-4">
          <h2 className="font-semibold mb-2">Latest Changes</h2>
          {changes.length === 0 ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <>
              <div className="mb-2 text-sm text-gray-700">
                <strong>{changes[0].version}</strong> - {changes[0].date}
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700 mb-2">
                {[
                  ...changes[0].added.slice(0,3).map((i: { text: string; children: string[] }) => i.text),
                  ...changes[0].changed.slice(0,3).map((i: { text: string; children: string[] }) => i.text),
                  ...changes[0].fixed.slice(0,3).map((i: { text: string; children: string[] }) => i.text),
                ].map((text: string, idx: number) => (
                  <li key={idx}>{text}</li>
                ))}
              </ul>
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
