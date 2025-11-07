/**
 * ItemCard Component
 * 
 * Displays an inventory item with rarity-based colors and type icons.
 */

interface ItemCardProps {
  item: {
    id: string;
    name: string;
    type: string;
    rarity: string;
    description?: string | null;
    power?: number | null;
    defense?: number | null;
    effect?: string | null;
    bonus?: string | null;
    icon?: string | null;
    effectKey?: string | null; // v0.26.8
  };
  quantity?: number;
  equipped?: boolean;
  onClick?: () => void;
}

const rarityColors: Record<string, string> = {
  common: "border-zinc-500 text-zinc-300 bg-zinc-950/20",
  uncommon: "border-green-500 text-green-300 bg-green-950/20",
  rare: "border-blue-500 text-blue-300 bg-blue-950/20",
  epic: "border-purple-500 text-purple-300 bg-purple-950/20",
  legendary: "border-yellow-500 text-yellow-300 bg-yellow-950/20",
  alpha: "border-red-500 text-red-300 bg-red-950/20 border-2", // v0.26.5
};

const typeIcons: Record<string, string> = {
  weapon: "⚔️",
  armor: "🛡️",
  consumable: "🧪",
  accessory: "💎",
};

export default function ItemCard({ item, quantity, equipped, onClick }: ItemCardProps) {
  const rarityClass = rarityColors[item.rarity] || rarityColors.common;
  const icon = item.icon || typeIcons[item.type] || "📦";

  return (
    <div
      className={`border-2 p-4 rounded-xl ${rarityClass} bg-card hover:bg-bg transition-all cursor-pointer flex flex-col items-center gap-2 ${
        equipped ? "ring-2 ring-accent" : ""
      }`}
      onClick={onClick}
    >
      {/* Icon */}
      <span className="text-4xl">{icon}</span>

      {/* Name */}
      <p className="font-bold text-center text-sm leading-tight">{item.name}</p>

      {/* Rarity Badge */}
      <span className="text-xs uppercase tracking-wide opacity-80">
        {item.rarity}
      </span>

      {/* Stats */}
      {item.power && (
        <div className="text-xs text-red-400">
          ⚔️ Power: {item.power}
        </div>
      )}
      {item.defense && (
        <div className="text-xs text-blue-400">
          🛡️ Defense: {item.defense}
        </div>
      )}
      {item.effect && (
        <div className="text-xs text-green-400">
          ✨ {item.effect}
        </div>
      )}
      {item.bonus && (
        <div className="text-xs text-purple-400">
          ✨ {item.bonus}
        </div>
      )}
      {/* Show effect description from config (v0.26.8) */}
      {item.effectKey && (() => {
        try {
          // Dynamic import to avoid SSR issues
          const { ITEM_EFFECTS } = require('@/lib/config/itemEffects');
          const effectDef = ITEM_EFFECTS[item.effectKey];
          if (effectDef) {
            let effectText = '';
            if (effectDef.type === 'heal') {
              if (effectDef.trigger === 'onRest') {
                effectText = `Restores ${effectDef.value} HP when resting`;
              } else if (effectDef.trigger === 'onCrit') {
                effectText = `Restores ${effectDef.value} HP on crit`;
              }
            } else if (effectDef.type === 'buff') {
              const percent = ((effectDef.value - 1) * 100).toFixed(0);
              if (effectDef.prop === 'damageMult') {
                effectText = `+${percent}% damage on attack`;
              } else if (effectDef.prop === 'critChance') {
                effectText = `+${(effectDef.value * 100).toFixed(0)}% crit chance on attack`;
              }
            } else if (effectDef.type === 'passive') {
              const percent = ((effectDef.value - 1) * 100).toFixed(0);
              if (effectDef.prop === 'xpMult') {
                effectText = `+${percent}% XP on kill`;
              } else if (effectDef.prop === 'goldMult') {
                effectText = `+${percent}% gold on kill`;
              }
            }
            return effectText ? (
              <div className="text-xs text-cyan-400 mt-1">
                ⚡ {effectText}
              </div>
            ) : null;
          }
        } catch (e) {
          // Silently fail if config is unavailable
        }
        return null;
      })()}

      {/* Quantity */}
      {quantity !== undefined && quantity > 1 && (
        <div className="text-xs font-bold bg-bg/80 px-2 py-1 rounded">
          x{quantity}
        </div>
      )}

      {/* Equipped Badge */}
      {equipped && (
        <div className="text-xs font-bold bg-accent text-white px-2 py-1 rounded flex items-center gap-1">
          ⭐ EQUIPPED
        </div>
      )}
    </div>
  );
}













