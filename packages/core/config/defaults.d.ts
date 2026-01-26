/**
 * Unified Config Defaults
 * C6 Step 3: Migration of Real Values
 * v0.42.19
 *
 * Real default values migrated from scattered constants.
 * Migrated from: packages/core/config/constants.ts, rewardConfig.ts
 */
import type { UnifiedConfig } from './schema';
/**
 * Complete unified config defaults
 * v0.42.21 - C6 Step 5: Feature Flags Migration Complete
 *
 * Migrated namespaces:
 * - gameplay: ✅ Complete (from constants.ts, rewardConfig.ts)
 * - api: ✅ Complete (from api/client/config.ts, pagination.ts, envelope.ts)
 * - app: ✅ Complete (from constants.ts, hooks, stores)
 * - security: ✅ Complete (from security.ts)
 * - platform: ✅ Complete (from env.ts, redis/client.ts)
 * - ui: ✅ Complete (from constants.ts, hooks, UI components) - v0.42.20
 * - features: ✅ Complete (from flags.ts) - v0.42.21
 */
export declare const unifiedConfigDefaults: UnifiedConfig;
