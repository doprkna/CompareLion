"use client";
import React, { useEffect, useState } from 'react';

const initialProfile = {
  name: '',
  email: '',
  phone: '',
  language: '',
  country: '',
  dateOfBirth: '',
  avatarUrl: '',
  motto: '',
  lastLoginAt: '',
  lastActiveAt: '',
  stats: { totalSessions: 0, totalAnswers: 0, totalTime: 0, lastSessionAnswers: 0, lastSessionTime: 0 },
  sessions: [],
  funds: '0',
  diamonds: 0,
  xp: 0,
  level: 1,
  theme: '',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
}
function msToHMS(ms: number) {
  if (!ms || ms < 0) return '0s';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [
    h ? h + 'h' : '',
    m ? m + 'm' : '',
    sec ? sec + 's' : '',
  ].filter(Boolean).join(' ');
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/api/profile`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            ...initialProfile,
            ...data.user,
            dateOfBirth: data.user.dateOfBirth ? data.user.dateOfBirth.slice(0, 10) : '',
            lastLoginAt: data.user.lastLoginAt || '',
            lastActiveAt: data.user.lastActiveAt || '',
            stats: data.user.stats || initialProfile.stats,
            sessions: data.user.sessions || [],
          });
        } else {
          setMessage('Failed to load profile.');
        }
      } catch {
        setMessage('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange: React.ChangeEventHandler<any> = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${base}/api/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Profile updated!');
      } else {
        setMessage(data.message || 'Update failed.');
      }
    } catch {
      setMessage('Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        {/* User Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <span className="font-semibold">Last login:</span><br />
            {formatDate(profile.lastLoginAt)}
          </div>
          <div>
            <span className="font-semibold">Last active:</span><br />
            {formatDate(profile.lastActiveAt)}
          </div>
          <div>
            <span className="font-semibold">Total sessions:</span><br />
            {profile.stats.totalSessions}
          </div>
          <div>
            <span className="font-semibold">Total answers:</span><br />
            {profile.stats.totalAnswers}
          </div>
          <div>
            <span className="font-semibold">Time spent (current session):</span><br />
            {msToHMS(profile.stats.lastSessionTime)}
          </div>
          <div>
            <span className="font-semibold">Total time spent:</span><br />
            {msToHMS(profile.stats.totalTime)}
          </div>
          <div>
            <span className="font-semibold">Last session answers:</span><br />
            {profile.stats.lastSessionAnswers}
          </div>
          <div>
            <span className="font-semibold">Streak:</span><br />
            {profile.streakCount}
          </div>
          <div>
            <span className="font-semibold">Today Answered:</span><br />
            {profile.today?.answered ?? 0}
          </div>
          <div>
            <span className="font-semibold">Today Skipped:</span><br />
            {profile.today?.skipped ?? 0}
          </div>
        </div>
        {/* Session history table */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2">Session History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-2 py-1 border">Date</th>
                  <th className="px-2 py-1 border">Answers</th>
                  <th className="px-2 py-1 border">Time Spent</th>
                </tr>
              </thead>
              <tbody>
                {profile.sessions.length === 0 ? (
                  <tr><td colSpan={3} className="text-center text-gray-400 py-2">No sessions yet.</td></tr>
                ) : (
                  profile.sessions.map((s: { id: string; startedAt: string; completedAt: string | null; answers: number; timeSpent: number }) => (
                    <tr key={s.id}>
                      <td className="px-2 py-1 border">{formatDate(s.startedAt)}</td>
                      <td className="px-2 py-1 border">{s.answers}</td>
                      <td className="px-2 py-1 border">{msToHMS(s.timeSpent)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Avatar/photo frame and upload button placeholder */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-4xl mb-2 border-2 border-blue-200">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span>👤</span>
            )}
          </div>
          <button className="text-blue-600 hover:underline text-sm" disabled>
            Upload Photo (coming soon)
          </button>
        </div>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input name="name" value={profile.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" value={profile.email} onChange={handleChange} className="w-full px-3 py-2 border rounded" type="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input name="phone" value={profile.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <input name="language" value={profile.language} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input name="country" value={profile.country} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input name="dateOfBirth" value={profile.dateOfBirth} onChange={handleChange} className="w-full px-3 py-2 border rounded" type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <input name="avatarUrl" value={profile.avatarUrl} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motto</label>
              <textarea name="motto" value={profile.motto} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Funds ($)</label>
              <input name="funds" value={profile.funds || '0'} readOnly className="w-full px-3 py-2 border rounded bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diamonds</label>
              <input name="diamonds" value={profile.diamonds || 0} readOnly className="w-full px-3 py-2 border rounded bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">XP</label>
              <input name="xp" value={profile.xp || 0} readOnly className="w-full px-3 py-2 border rounded bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <input name="level" value={profile.level || 1} readOnly className="w-full px-3 py-2 border rounded bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                name="theme"
                value={profile.theme || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">System Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="blue">Blue</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {message && <div className="text-center text-sm text-blue-700 mt-2">{message}</div>}
          </form>
        )}
        {/* History button placeholder */}
        <div className="mt-8 flex justify-center">
          <button className="bg-gray-100 text-blue-700 px-4 py-2 rounded hover:bg-gray-200 transition font-semibold border border-blue-200" disabled>
            View History (coming soon)
          </button>
        </div>
        {/* Achievements grid placeholder */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-2">Achievements</h2>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_: unknown, i: number) => (
              <div key={i} className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-2xl text-gray-400 border-2 border-blue-100">
                🏆
              </div>
            ))}
          </div>
          <div className="text-center text-gray-500 text-sm mt-2">(Achievements coming soon)</div>
        </div>
      </div>
    </div>
  );
}
