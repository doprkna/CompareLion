/**
 * KarmaPrestige Component
 * 
 * Displays karma and prestige scores for user identity.
 * Karma = moral flavor (what you do/did/would do)
 * Prestige = capability/status (what you can do/represent)
 */

interface KarmaPrestigeProps {
  karma: number;
  prestige: number;
  className?: string;
  variant?: 'full' | 'compact';
}

export default function KarmaPrestige({
  karma,
  prestige,
  className = "",
  variant = 'full'
}: KarmaPrestigeProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex gap-3 text-xs ${className}`}>
        <span title="Karma Score">☯️ {karma > 0 ? `+${karma}` : karma}</span>
        <span title="Prestige Score">👑 {prestige}</span>
      </div>
    );
  }

  return (
    <div className={`flex justify-around text-sm ${className}`}>
      <div className="text-center">
        <div className="text-2xl mb-1">☯️</div>
        <div className="font-bold text-text">
          {karma > 0 ? `+${karma}` : karma}
        </div>
        <div className="text-xs text-subtle">Karma</div>
      </div>
      <div className="text-center">
        <div className="text-2xl mb-1">👑</div>
        <div className="font-bold text-text">{prestige}</div>
        <div className="text-xs text-subtle">Prestige</div>
      </div>
    </div>
  );
}










