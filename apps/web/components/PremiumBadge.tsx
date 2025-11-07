'use client';

import { Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumBadgeProps {
  tier: 'PREMIUM' | 'CREATOR';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function PremiumBadge({ tier, size = 'md', animated = true }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const isPremium = tier === 'PREMIUM';
  const isCreator = tier === 'CREATOR';

  const badge = (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        ${sizeClasses[size]}
        ${isPremium ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''}
        ${isCreator ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : ''}
      `}
    >
      {isPremium && <Crown size={iconSizes[size]} />}
      {isCreator && <Sparkles size={iconSizes[size]} />}
      <span>{tier}</span>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
}

interface LockedFeatureProps {
  featureName: string;
  requiredTier: 'PREMIUM' | 'CREATOR';
  onUpgrade?: () => void;
}

export function LockedFeature({ featureName, requiredTier, onUpgrade }: LockedFeatureProps) {
  return (
    <div className="relative">
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/20 rounded-lg z-10 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-lg font-bold text-white mb-2">
            {featureName}
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            Unlock with {requiredTier}
          </p>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              Upgrade Now
            </button>
          )}
        </div>
      </div>

      {/* Placeholder content */}
      <div className="opacity-30 pointer-events-none">
        <div className="bg-gray-800 rounded-lg p-6 h-64" />
      </div>
    </div>
  );
}

export function PremiumFeatureGate({
  children,
  featureName,
  requiredTier,
  userTier,
  onUpgrade,
}: {
  children: React.ReactNode;
  featureName: string;
  requiredTier: 'PREMIUM' | 'CREATOR';
  userTier: 'FREE' | 'PREMIUM' | 'CREATOR';
  onUpgrade?: () => void;
}) {
  // Check if user has access
  const tierLevels = { FREE: 0, PREMIUM: 1, CREATOR: 2 };
  const hasAccess = tierLevels[userTier] >= tierLevels[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <LockedFeature
      featureName={featureName}
      requiredTier={requiredTier}
      onUpgrade={onUpgrade}
    />
  );
}

