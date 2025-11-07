"use client";

interface ClanBuffBadgeProps {
  buff: {
    type: 'xp' | 'gold' | 'karma' | 'compare' | 'reflect';
    value: number;
    clanName: string;
  } | null;
  compact?: boolean;
}

export function ClanBuffBadge({ buff, compact = false }: ClanBuffBadgeProps) {
  if (!buff) return null;

  const buffLabels: Record<string, { label: string; color: string; icon: string }> = {
    xp: { label: 'XP', color: 'bg-blue-500', icon: '⭐' },
    gold: { label: 'Gold', color: 'bg-yellow-500', icon: '💰' },
    karma: { label: 'Karma', color: 'bg-purple-500', icon: '✨' },
    compare: { label: 'Compare', color: 'bg-green-500', icon: '🔄' },
    reflect: { label: 'Reflection', color: 'bg-indigo-500', icon: '🪶' },
  };

  const buffInfo = buffLabels[buff.type] || { label: buff.type, color: 'bg-gray-500', icon: '✨' };
  const buffPercent = ((buff.value - 1) * 100).toFixed(0);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-white ${buffInfo.color}`}>
        <span>{buffInfo.icon}</span>
        <span>Micro-Clan {buffInfo.label} +{buffPercent}%</span>
      </div>
    );
  }

  return (
    <div className={`rounded border-2 border-gray-300 p-3 bg-white ${buffInfo.color} bg-opacity-10`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{buffInfo.icon}</span>
        <div className="font-semibold">Micro-Clan Buff Active</div>
      </div>
      <div className="text-sm text-gray-700">
        <span className="font-semibold">{buffInfo.label} +{buffPercent}%</span>
        <span className="text-gray-500"> • {buff.clanName}</span>
      </div>
    </div>
  );
}

