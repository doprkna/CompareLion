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
  };
  quantity?: number;
  equipped?: boolean;
  onClick?: () => void;
}

const rarityColors: Record<string, string> = {
  common: "border-zinc-500 text-zinc-300",
  uncommon: "border-green-500 text-green-300",
  rare: "border-blue-500 text-blue-300",
  epic: "border-purple-500 text-purple-300",
  legendary: "border-yellow-500 text-yellow-300",
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

      {/* Quantity */}
      {quantity !== undefined && quantity > 1 && (
        <div className="text-xs font-bold bg-bg/80 px-2 py-1 rounded">
          x{quantity}
        </div>
      )}

      {/* Equipped Badge */}
      {equipped && (
        <div className="text-xs font-bold bg-accent text-white px-2 py-1 rounded">
          EQUIPPED
        </div>
      )}
    </div>
  );
}











