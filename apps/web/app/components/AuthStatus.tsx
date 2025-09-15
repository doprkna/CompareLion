"use client";
import React, { useEffect, useState } from 'react';

export default function AuthStatus() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([]);
  const [selectedLang, setSelectedLang] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await fetch('/api/languages');
        if (res.ok) {
          const data = await res.json();
          setLanguages(data.languages || []);
        }
      } catch {}
    };
    fetchLanguages();
  }, []);

  return (
    <div className="ml-auto text-sm text-gray-700 font-medium flex items-center gap-4">
      <div>
        <label htmlFor="lang" className="sr-only">Language</label>
        <select
          id="lang"
          className="px-2 py-1 border rounded text-sm bg-white"
          value={selectedLang}
          onChange={e => setSelectedLang(e.target.value)}
        >
          <option value="">Language</option>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>
      <div>
        {loading ? 'Checking auth...' : user ? `Logged in as ${user.email}` : 'Not logged in'}
      </div>
    </div>
  );
}
