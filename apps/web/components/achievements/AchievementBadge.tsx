import { Achievement } from '@/types/achievement';

export default function AchievementBadge({ a, locked = false }: { a: Achievement; locked?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${locked ? 'opacity-50 grayscale' : ''}`}
      title={`${a.title} — ${a.description}`}
      aria-label={`${a.title}: ${a.description}`}
    >
      <div className="text-3xl leading-none mb-2">{a.icon}</div>
      <div className="text-sm font-medium">{a.title}</div>
      <div className="text-xs text-gray-500 mt-1">{a.description}</div>
    </div>
  );
}
