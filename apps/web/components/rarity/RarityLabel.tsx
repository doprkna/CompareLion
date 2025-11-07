"use client";

interface RarityLabelProps {
  rarity?: {
    key?: string;
    name?: string;
    colorPrimary?: string;
    colorGlow?: string;
    frameStyle?: string;
    rankOrder?: number;
    description?: string;
  } | string | null;
  showTooltip?: boolean;
  className?: string;
}

export function RarityLabel({ rarity, showTooltip = false, className = '' }: RarityLabelProps) {
  if (!rarity) return null;

  const rarityData = typeof rarity === 'string' 
    ? { key: rarity, name: rarity, colorPrimary: '#9ca3af', description: null }
    : rarity;

  const name = rarityData.name || rarityData.key || 'Unknown';
  const colorPrimary = rarityData.colorPrimary || '#9ca3af';
  const description = rarityData.description || null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${className}`}
      style={{ 
        backgroundColor: `${colorPrimary}20`,
        color: colorPrimary,
        borderColor: colorPrimary,
      }}
      title={showTooltip && description ? `${name}: ${description}` : undefined}
    >
      {name}
      {showTooltip && description && (
        <span className="ml-1 text-gray-500" title={description}>ℹ️</span>
      )}
    </span>
  );
}

