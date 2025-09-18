import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import AchievementsGrid from '@/components/achievements/AchievementsGrid';

export default async function MainPage() {
  // Fetch user info
  const meData = await apiFetch('/api/me').catch(() => null);
  const user = meData?.user;
  // Fetch latest changelog entry
  const chData = await apiFetch('/api/changelog').catch(() => null);
  const latest = chData?.success && chData.entries?.length ? chData.entries[0] : null;
  // Fetch achievements
  const achData = await apiFetch('/api/achievements').catch(() => null);
  const achievements = achData?.success ? achData.achievements.slice(0, 6) : [];
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome */}
      <h1 className="text-3xl font-bold mb-4">Hello, {user?.name || user?.email || 'User'} 👋</h1>
      {/* Latest Changes */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Latest Changes</h2>
        {latest ? (
          <>
            <div className="mb-2 text-sm text-gray-700">
              <strong>{latest.version}</strong>{latest.date ? ` - ${latest.date}` : ''}
            </div>
            {(['added', 'changed', 'fixed'] as const).map((sec) => {
              const items = latest[sec];
              if (!items || items.length === 0) return null;
              return (
                <div key={sec} className="mb-2">
                  <h3 className="font-medium capitalize mb-1">{sec}</h3>
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
            <Link href="/changelog" className="text-blue-600 hover:underline text-sm">See all changes</Link>
          </>
        ) : (
          <p className="text-gray-500">Changelog unavailable</p>
        )}
      </div>
      {/* Achievements */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Achievements</h2>
          <Link href="/achievements" className="text-sm text-blue-600 hover:underline">See all</Link>
        </div>
        <AchievementsGrid achievements={achievements} earnedIds={new Set()} />
        <p className="text-xs text-gray-500 mt-3">More badges unlock as you play PareL.</p>
      </div>
      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/tasks" className="bg-white p-4 rounded-lg shadow text-center">Tasks</Link>
        <Link href="/questions" className="bg-white p-4 rounded-lg shadow text-center">Questions</Link>
        <Link href="/shop" className="bg-white p-4 rounded-lg shadow text-center">Shop</Link>
        <Link href="/leaderboard" className="bg-white p-4 rounded-lg shadow text-center">Leaderboard</Link>
        <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">News (coming soon)</div>
      </div>
    </div>
  );
}
