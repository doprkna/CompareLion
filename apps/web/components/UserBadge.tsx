/**
 * UserBadge Component
 * 
 * Displays user identity badge based on type.
 * Types: none, subscriber, vip, wtf
 */

interface UserBadgeProps {
  type: string;
  className?: string;
}

const badgeConfig: Record<string, { emoji: string; label: string; description: string }> = {
  none: {
    emoji: "⚪",
    label: "Just You",
    description: "Regular user",
  },
  subscriber: {
    emoji: "💎",
    label: "Subscriber",
    description: "Premium supporter",
  },
  vip: {
    emoji: "🌟",
    label: "VIP",
    description: "Public figure or influencer",
  },
  wtf: {
    emoji: "🧠",
    label: "WTF User",
    description: "Wiki Truth Fact Checker",
  },
};

export default function UserBadge({ type, className = "" }: UserBadgeProps) {
  const config = badgeConfig[type] || badgeConfig.none;

  if (type === "none") {
    return null; // Don't show badge for regular users
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-semibold ${className}`}
      title={config.description}
    >
      {config.emoji} {config.label}
    </span>
  );
}

/**
 * Badge Icon Only (compact version)
 */
export function UserBadgeIcon({ type, className = "" }: UserBadgeProps) {
  const config = badgeConfig[type] || badgeConfig.none;

  if (type === "none") {
    return null;
  }

  return (
    <span className={`text-lg ${className}`} title={`${config.label} - ${config.description}`}>
      {config.emoji}
    </span>
  );
}










