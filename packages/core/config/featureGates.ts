/**
 * Unified feature gate / lock mechanics
 * v0.46.08 - Alpha lock system for UI features
 *
 * Gates by: level, premium, admin, beta, custom message.
 * Priority when multiple apply: admin > premium > beta > level > custom.
 */

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export const FEATURE_KEYS = [
  'FLOW_BROWSER',
  'CATEGORIES',
  'RPG',
  'DEEP_REPORT',
  'INVITE',
  'MARKETPLACE',
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type LockReason =
  | { level: { minLevel: number } }
  | { premium: true }
  | { admin: true }
  | { beta: true }
  | { custom: { message: string } };

export interface FeatureGateUser {
  level?: number;
  role?: string;
  isPremium?: boolean;
  isBeta?: boolean;
}

export interface FeatureAccessResult {
  allowed: boolean;
  reason?: LockReason;
  message: string;
}

// ---------------------------------------------------------------------------
// GATE CONFIG (centralized)
// ---------------------------------------------------------------------------

interface GateRule {
  level?: number;
  admin?: boolean;
  beta?: boolean;
  custom?: string;
}

const FEATURE_GATES: Record<FeatureKey, GateRule> = {
  FLOW_BROWSER: { level: 3 },
  CATEGORIES: { level: 3 },
  RPG: { level: 3 },
  DEEP_REPORT: { level: 5 }, // Premium gating TODO: when User.isPremium exists
  INVITE: { level: 3 },
  MARKETPLACE: { level: 5 },
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function formatLevelMessage(minLevel: number): string {
  return `Unlocks at level ${minLevel}.`;
}

function getMessageForReason(reason: LockReason): string {
  if ('level' in reason) return formatLevelMessage(reason.level.minLevel);
  if ('premium' in reason) return 'Premium required.';
  if ('admin' in reason) return 'Admin only.';
  if ('beta' in reason) return 'Available to beta testers.';
  if ('custom' in reason) return reason.custom.message;
  return 'Locked.';
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

/**
 * Check if user can access a feature.
 * Returns { allowed, reason?, message }.
 * Priority: admin > premium > beta > level > custom.
 */
const SIGN_IN_REQUIRED: FeatureAccessResult = {
  allowed: false,
  message: 'Sign in required.',
  reason: { custom: { message: 'Sign in required.' } },
};

export function canAccessFeature(
  user: FeatureGateUser | null | undefined,
  featureKey: FeatureKey
): FeatureAccessResult {
  if (!user) {
    return SIGN_IN_REQUIRED;
  }
  const rule = FEATURE_GATES[featureKey];
  if (!rule) {
    return { allowed: true, message: 'Available' };
  }

  const level = user.level ?? 1;
  const role = user.role ?? 'USER';
  const isAdmin = role === 'ADMIN';
  const isBeta = user.isBeta ?? false;

  const devUnlock = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DEV_UNLOCK === 'true';
  if (devUnlock) {
    return { allowed: true, message: 'Available' };
  }

  const reasons: Array<{ reason: LockReason; priority: number }> = [];

  if (rule.admin && !isAdmin) {
    reasons.push({ reason: { admin: true }, priority: 4 });
  }
  if (rule.beta && !isBeta) {
    reasons.push({ reason: { beta: true }, priority: 2 });
  }
  if (rule.level != null && level < rule.level) {
    reasons.push({ reason: { level: { minLevel: rule.level } }, priority: 1 });
  }
  if (rule.custom) {
    reasons.push({ reason: { custom: { message: rule.custom } }, priority: 0 });
  }

  if (reasons.length === 0) {
    return { allowed: true, message: 'Available' };
  }

  reasons.sort((a, b) => b.priority - a.priority);
  const top = reasons[0];
  return {
    allowed: false,
    reason: top.reason,
    message: getMessageForReason(top.reason),
  };
}
