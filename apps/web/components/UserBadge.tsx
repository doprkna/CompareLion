/**
 * UserBadge Component
 *
 * Displays user identity badge based on User.badgeType (header/profile).
 * Source of truth for display: this badgeConfig; storage: User.badgeType + UserBadge table.
 * Types: none, subscriber, vip, wtf, alpha_contributor
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
  alpha_contributor: {
    emoji: "🎯",
    label: "Alpha Contributor",
    description: "Completed Alpha Feedback and helped shape Parel",
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













