# C6: Config Unification Architecture
**Version:** v0.42.24  
**Status:** Step 8 Complete - Legacy Config Removal + Constant Purge (90% complete - cleanup finished)

---

## Overview

C6 Config Unification consolidates all scattered configuration values across the PAREL codebase into a single, type-safe, unified config system located at `@parel/core/config`.

### Goals

1. **Single Source of Truth:** All config values in one place
2. **Type Safety:** Full TypeScript support with autocomplete
3. **Immutability:** Config cannot be mutated after initialization
4. **Environment Layering:** Support for dev/staging/prod overrides
5. **Plugin System:** Extensible via plugins
6. **Type-Safe Access:** Compile-time guarantees for config access

---

## Architecture

### Namespace Structure

```
config/
├── gameplay/          # Game mechanics, XP, currency, rewards
│   ├── xp
│   ├── currency
│   ├── economy
│   ├── rewards
│   ├── karma
│   ├── prestige
│   ├── scoring
│   ├── achievements
│   ├── leaderboard
│   └── defaults
├── ui/                # UI tokens, timing, animations, colors, toasts, typography
│   ├── timing         # Debounce, animation durations, polling intervals
│   ├── toast          # Toast limits, durations, delays
│   ├── colors         # Karma, prestige, difficulty, status colors
│   ├── mood           # Mood theme colors (joy, sad, anger, calm, chaos, hope)
│   ├── typography     # Font sizes, line heights, font weights
│   ├── spacing        # Spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
│   ├── radii          # Border radius presets (sm, md, lg, xl, full)
│   └── shadows         # Shadow presets (sm, md, lg, xl, none)
├── api/                # API client, pagination, generator
│   ├── client
│   ├── pagination
│   └── generator
├── app/                # App limits, polling, cache
│   ├── limits
│   ├── polling
│   └── cache
├── platform/           # Platform services (Redis, env)
│   ├── redis
│   └── environment
├── security/           # Security settings
│   ├── auth
│   ├── captcha
│   └── rateLimit
└── features/           # Feature flags
    ├── enableBase
    ├── enableTrials
    ├── enableThemes
    ├── enableEconomyV2
    ├── enableAnalytics
    └── environment
```

---

## File Structure

```
packages/core/config/
├── schema.ts           # TypeScript interfaces + validation functions
├── defaults.ts         # Base default values
├── load.ts             # Runtime loader (merging, validation, freezing)
├── flags.ts            # Dynamic feature flags layer (v0.42.23)
├── plugins.ts           # Plugin extension system (v0.42.23)
├── unified.ts          # ConfigManager (legacy, still supported)
├── index.ts            # Public exports (exports loaded config)
└── MAPPING_TABLE.md    # Migration mapping (old → new)
```

---

## Type System

### Core Types

```typescript
// Root config interface
interface UnifiedConfig {
  gameplay: GameplayConfig;
  ui: UiConfig;
  api: ApiConfig;
  app: AppConfig;
  platform: PlatformConfig;
  security: SecurityConfig;
  features: FeaturesConfig;
}

// Partial config for overrides
type PartialUnifiedConfig = Partial<{
  [K in keyof UnifiedConfig]: Partial<UnifiedConfig[K]>;
}>;

// Config metadata
interface ConfigMetadata {
  severity: 'critical' | 'normal' | 'legacy';
  description?: string;
  source?: string;
  defaultValue?: unknown;
  required?: boolean;
  environment?: EnvironmentLayer[];
}
```

---

## Initialization

### Basic Usage

The config is automatically loaded when imported:

```typescript
import { config } from '@parel/core/config';

// Config is already loaded, validated, and frozen
const multiplier = config.gameplay.xp.levelMultiplier; // Type-safe!
```

### Manual Loading with Overrides

If you need to provide custom overrides:

```typescript
import { loadConfig } from '@parel/core/config';

const customConfig = loadConfig({
  gameplay: {
    xp: {
      levelMultiplier: 200, // Override default
    },
  },
});

// Use customConfig instead of default config
```

### Environment-Specific Overrides

Environment variables are automatically applied. For manual overrides:

```typescript
import { loadConfig } from '@parel/core/config';

const overrides: PartialUnifiedConfig = {
  api: {
    client: {
      timeout: process.env.NODE_ENV === 'production' ? 60000 : 30000,
    },
  },
};

const config = loadConfig(overrides);
```

### Loading Process

When `loadConfig()` is called (or config is imported):

1. **Load Base Defaults** - From `defaults.ts`
2. **Apply Environment Layer** - Environment-specific overrides
3. **Apply Runtime Overrides** - From `process.env`
4. **Apply User Overrides** - Passed to `loadConfig()`
5. **Enforce Required Fields** - Crash if missing
6. **Validate Config** - Type, range, enum validation
7. **Deep Freeze** - Make config immutable
8. **Return Config** - Read-only, validated config

---

## Access Patterns

### Type-Safe Access

```typescript
import {
  getGameplayConfig,
  getUiConfig,
  getApiConfig,
  getAppConfig,
  getPlatformConfig,
  getSecurityConfig,
  getFeaturesConfig,
} from '@parel/core/config';

// Namespace-specific helpers
const gameplay = getGameplayConfig();
const xpMultiplier = gameplay.xp.levelMultiplier; // Type-safe!

// Nested value access
import { getConfigValue } from '@parel/core/config';
const value = getConfigValue('gameplay', 'xp', 'levelMultiplier');
```

### Direct Access

```typescript
import { getConfig } from '@parel/core/config';

const config = getConfig('gameplay');
const xp = config.xp; // Type-safe!
```

---

## Immutability

All config values are **deep frozen** after loading to prevent mutations:

```typescript
import { config } from '@parel/core/config';
config.gameplay.xp.levelMultiplier = 200; // ❌ TypeError: Cannot assign to read-only property
```

### Immutability Guarantees

1. **Deep Freeze:** All nested objects and arrays are frozen
2. **Read-Only Types:** Config is typed as `Readonly<UnifiedConfig>`
3. **Runtime Protection:** `Object.freeze()` prevents property modifications
4. **No Exceptions:** Immutability applies to all config values

### Benefits

- **Config Consistency:** Config cannot be accidentally modified
- **Predictable Behavior:** Config values remain constant throughout app lifecycle
- **Thread Safety:** Safe for concurrent access (if needed)
- **Debugging:** Easier to debug when config values don't change unexpectedly

### How It Works

The `loadConfig()` function:
1. Merges all config layers
2. Validates the final config
3. Deep freezes the entire config tree
4. Returns read-only config

```typescript
// Config is frozen at load time
const config = loadConfig();

// All of these will throw:
config.gameplay = {}; // ❌ Cannot assign
config.gameplay.xp = {}; // ❌ Cannot assign
config.gameplay.xp.levelMultiplier = 200; // ❌ Cannot assign
```

### Overriding Config

To change config values, you must:
1. Pass overrides to `loadConfig()` at initialization
2. Or use environment variables (applied at load time)
3. Or use plugin system (applied at load time)

Config cannot be modified after load.

---

## Environment Layering

Config values are layered in this order (later overrides earlier):

1. **Base Defaults** (`defaults.ts`) - Static default values
2. **Environment Layer** (`getEnvironmentConfig()`) - Environment-specific overrides (dev/stage/prod)
3. **Runtime Overrides** (`getRuntimeOverrides()`) - Environment variables from `process.env`
4. **User Overrides** - Passed to `loadConfig()` (highest priority)

### Environment Detection

The loader automatically detects and applies environment-specific values:

```typescript
// Auto-detected from process.env in load.ts
config.platform.environment = {
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',
  hasRedis: !!process.env.REDIS_URL,
  hasDb: !!process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV || 'development',
  redisUrl: process.env.REDIS_URL,
  databaseUrl: process.env.DATABASE_URL,
};
```

### Environment-Specific Config Files (Future)

The system supports environment-specific config files:
- `config.dev.ts` - Development overrides
- `config.stage.ts` - Staging overrides
- `config.prod.ts` - Production overrides

These are loaded via `getEnvironmentConfig()` and merged with base defaults.

### Required vs Optional

The config system enforces required fields and validates all values:

#### Required Fields

**Required namespaces** (must exist, crash if missing):
- `gameplay` - Game mechanics config
- `ui` - UI tokens and design system
- `api` - API client configuration
- `app` - App limits and settings
- `platform` - Platform services
- `security` - Security settings
- `features` - Feature flags

**Required field enforcement:**
- Missing required namespaces cause immediate crash on load
- Error message shows which namespaces are missing
- This prevents runtime errors from missing config

#### Optional Fields

- Most config values have sensible defaults
- Optional fields fall back to defaults if not provided
- No crash if optional fields are missing

#### Validation

All config values are validated on load:
- **Type validation:** Ensures types match schema
- **Range validation:** Validates numeric ranges (e.g., `>= 0`, `>= 1`)
- **Enum validation:** Validates enum values (e.g., `environment: 'development' | 'production' | 'test'`)
- **Required validation:** Ensures required fields exist

**Validation errors:**
- In development: Detailed error messages with paths and expected/actual values
- In production: Generic error message (security)
- Always throws on validation failure (critical)

**Validation warnings:**
- Shown in development mode only
- Non-blocking (config still loads)
- Examples: disabled critical features, deprecated values

---

## Plugin System

### Creating a Plugin

```typescript
import { registerConfigPlugin, ConfigPlugin } from '@parel/core/config';

const myPlugin: ConfigPlugin = {
  name: 'my-plugin',
  version: '1.0.0', // Optional
  extend(config) {
    // Must be pure (no side effects)
    // Can read from config but should not modify it
    return {
      gameplay: {
        xp: {
          levelMultiplier: config.gameplay.xp.levelMultiplier * 2, // Double XP!
        },
      },
    };
  },
};

// Register before config is loaded
registerConfigPlugin(myPlugin);

// Plugins are automatically applied during loadConfig()
```

### Plugin Execution Order

Plugins are applied in **registration order** during config loading:
1. Plugins registered first are applied first
2. Later plugins can override earlier ones
3. Plugins are applied after user overrides but before validation

### Plugin Constraints

**Required:**
- ✅ **Pure functions:** No side effects (no API calls, no mutations)
- ✅ **No circular dependencies:** Plugins cannot depend on each other
- ✅ **Return partial config:** Only return the config values you want to add/override

**Forbidden:**
- ❌ Side effects (API calls, file I/O, mutations)
- ❌ Circular dependencies between plugins
- ❌ Returning full config (only return partial)

### Plugin Registration

Plugins must be registered **before** config is loaded:

```typescript
// ✅ Good: Register before import
import { registerConfigPlugin } from '@parel/core/config';

registerConfigPlugin({
  name: 'my-plugin',
  extend: (config) => ({ /* ... */ }),
});

// Then import config (which triggers loadConfig)
import { config } from '@parel/core/config';
```

### Plugin Error Handling

- Plugin errors are caught and logged
- Failed plugins do not crash config loading
- Other plugins continue to be applied
- Errors are logged in development mode

### Plugin Validation

Plugins are validated before registration:

```typescript
import { validatePlugin } from '@parel/core/config';

const result = validatePlugin(myPlugin);
if (!result.valid) {
  console.error('Plugin validation errors:', result.errors);
}
```

---

## Merging Rules

### Deep Merge Logic

The config system uses a deep merge strategy with the following rules:

1. **Objects:** Recursively merged (nested properties preserved)
2. **Arrays:** Replaced (not merged) - arrays are completely replaced
3. **Primitives:** Replaced (strings, numbers, booleans)
4. **Undefined:** Ignored (doesn't override existing values)

```typescript
// Example merge
const base = { a: { b: 1, c: 2 }, items: [1, 2] };
const override = { a: { b: 3 }, items: [3, 4] };
// Result: { a: { b: 3, c: 2 }, items: [3, 4] }
// - c preserved (object merge)
// - items replaced (array replacement)
```

### Merge Order (Priority)

Config values are merged in this order (later overrides earlier):

1. **Base Defaults** (`defaults.ts`) - Lowest priority
2. **Environment Layer** (`getEnvironmentConfig()`) - Dev/stage/prod overrides
3. **Runtime Overrides** (`getRuntimeOverrides()`) - Environment variables
4. **User Overrides** (passed to `loadConfig()`) - User-provided overrides
5. **Plugin Extensions** (`applyPlugins()`) - Highest priority (applied during load)

```typescript
// Example: Final value determined by highest priority
// Base: timeout = 30000
// Env: timeout = 60000 (production)
// Runtime: timeout = 90000 (env var)
// User: timeout = 120000 (override)
// Result: timeout = 120000 (user override wins)
```

---

## Migration Strategy

### Step 1: Discovery ✅
- Scanned all allowed folders
- Identified 176+ config values
- Mapped to proposed namespaces

### Step 2: Design ✅ (Current)
- Created TypeScript schemas
- Defined namespace structure
- Created placeholder defaults
- Documented architecture

### Step 3: Migration (Next)
- Migrate real values from scattered constants
- Update all imports
- Remove old constant files
- Test thoroughly

### Step 4: Cleanup
- Remove legacy config files
- Update documentation
- Final validation

---

## Best Practices

### 1. Initialize Early

```typescript
// app.ts or _app.tsx
import { initUnifiedConfig } from '@parel/core/config';

initUnifiedConfig(); // Before any other imports that use config
```

### 2. Use Type-Safe Helpers

```typescript
// ✅ Good
import { getGameplayConfig } from '@parel/core/config';
const multiplier = getGameplayConfig().xp.levelMultiplier;

// ❌ Avoid
const config = getConfig('gameplay');
const multiplier = (config as any).xp.levelMultiplier; // Loses type safety
```

### 3. Don't Mutate Config

```typescript
// ❌ Never do this
const config = getConfig('gameplay');
config.xp.levelMultiplier = 200; // Will throw!

// ✅ Use overrides instead
initUnifiedConfig({
  gameplay: {
    xp: { levelMultiplier: 200 },
  },
});
```

### 4. Use Environment Variables for Secrets

```typescript
// ✅ Good - secrets from env
initUnifiedConfig({
  security: {
    captcha: {
      secret: process.env.HCAPTCHA_SECRET || '',
    },
  },
});
```

---

## Testing

### Unit Tests

```typescript
import { initUnifiedConfig, getConfig } from '@parel/core/config';

describe('Unified Config', () => {
  beforeEach(() => {
    // Reset config for each test
    initUnifiedConfig();
  });

  it('should return default values', () => {
    const config = getConfig('gameplay');
    expect(config.xp.levelMultiplier).toBe(100);
  });

  it('should apply overrides', () => {
    initUnifiedConfig({
      gameplay: {
        xp: { levelMultiplier: 200 },
      },
    });
    const config = getConfig('gameplay');
    expect(config.xp.levelMultiplier).toBe(200);
  });
});
```

---

## Performance Considerations

- **Initialization:** One-time cost at app startup
- **Access:** O(1) - direct property access
- **Memory:** Config is frozen, shared across app
- **Bundle Size:** Minimal - only used config is included

---

## Future Enhancements

1. **Runtime Validation:** Zod schemas for runtime type checking
2. **Config Hot Reload:** Development-only config updates
3. **Config Diffing:** Track config changes over time
4. **Config Analytics:** Monitor config usage patterns
5. **Remote Config:** Support for remote config updates (future)

---

## References

- **Mapping Table:** `packages/core/config/MAPPING_TABLE.md`
- **Schema:** `packages/core/config/schema.ts`
- **Defaults:** `packages/core/config/defaults.ts`
- **Entrypoint:** `packages/core/config/unified.ts`

---

## Dynamic Feature Flags

### Flag Resolution Order

Feature flags are resolved in this priority order (later overrides earlier):

1. **Cache** (if valid, 5-minute TTL)
2. **Environment Variable Override** (`PAREL_FLAG_*`) - Highest priority
3. **Remote Flag Service** (stubbed, future implementation)
4. **Static Default** (`config.features.*`) - Fallback

### Environment Variable Overrides

Flags can be overridden via environment variables:

```bash
# Format: PAREL_FLAG_<FLAG_NAME>
PAREL_FLAG_ENABLE_THEMES=true
PAREL_FLAG_ENABLE_ECONOMY_V2=false
```

The flag name is converted to uppercase with underscores:
- `enableThemes` → `PAREL_FLAG_ENABLE_THEMES`
- `enableEconomyV2` → `PAREL_FLAG_ENABLE_ECONOMY_V2`

### Remote Flag Service (Future)

The system includes a stubbed interface for remote flag services:

```typescript
import { setRemoteFlagSource } from '@parel/core/config';

// Future implementation
setRemoteFlagSource({
  async getFlag(name) {
    // Fetch from API or remote config service
    return await fetchFlagFromAPI(name);
  },
  async getAllFlags() {
    return await fetchAllFlagsFromAPI();
  },
});
```

### Flag Evaluation with Context

For future targeting (user segments, regions, A/B testing):

```typescript
import { evaluateFlag, config } from '@parel/core/config';

const isEnabled = await evaluateFlag('enableThemes', config, {
  userId: 'user123',
  region: 'US',
  userSegment: 'beta',
});
```

### Caching

- Flags are cached in memory for 5 minutes
- Cache is checked first before other layers
- Cache can be cleared with `clearFlagCache()`

### Usage

**Async (recommended for remote flags):**
```typescript
import { getFeatureFlag, config } from '@parel/core/config';

const isEnabled = await getFeatureFlag('enableThemes', config);
```

**Sync (uses static config only):**
```typescript
import { getFeatureFlagSync, config } from '@parel/core/config';

const isEnabled = getFeatureFlagSync('enableThemes', config);
```

**Batch operations:**
```typescript
import { getFeatureFlags, config } from '@parel/core/config';

const flags = await getFeatureFlags(['enableThemes', 'enableTrials'], config);
// { enableThemes: true, enableTrials: true }
```

---

## Feature Flags

### Naming Rules

Feature flags MUST follow these naming conventions:

1. **Prefix Pattern:** `enable*`, `disable*`, or `show*`
   - ✅ `enableSocialFeed`
   - ✅ `enableNewXPFlow`
   - ✅ `disableAchievementsTemporary`
   - ✅ `showExperimentalEvents`
   - ❌ `socialFeedEnabled` (wrong prefix)
   - ❌ `newXPFlow` (missing prefix)

2. **CamelCase:** Use camelCase, max two words after prefix
   - ✅ `enableTrials`
   - ✅ `enableEconomyV2`
   - ❌ `enable_new_xp_flow` (snake_case not allowed)
   - ❌ `enableSocialFeedBeta` (too many words)

3. **Location:** All flags MUST live under `config.features.*`
   - ✅ `config.features.enableThemes`
   - ❌ `config.app.enableThemes` (wrong namespace)

4. **No Per-Module Flags:** Do not create separate `flags.ts` files per module
   - ✅ All flags in `packages/core/config/defaults.ts`
   - ❌ `packages/features/social/flags.ts` (not allowed)

### Flag Layering Model

Feature flags support three layers (applied in order):

1. **Default/Static Flags:** Hardcoded in `defaults.ts`
   ```typescript
   enableBase: true,        // Always enabled
   enableTrials: true,     // Always enabled
   enableEconomyV2: false, // Always disabled
   ```

2. **Environment-Derived Flags:** Set from `process.env` in `unified.ts`
   ```typescript
   enableAnalytics: process.env.ENABLE_ANALYTICS === '1' || process.env.ENABLE_ANALYTICS === 'true',
   environment: env === 'production' ? 'production' : env === 'development' ? 'development' : 'test',
   ```

3. **Dynamic Flags (Future - Step 7):** Remote config updates
   - Will be implemented in C6 Step 7
   - Supports runtime flag updates without deployment

### Kill-Switch Pattern

For critical features, use the kill-switch pattern:

```typescript
import { getFeaturesConfig } from '@parel/core/config';

const features = getFeaturesConfig();

// Kill-switch: disable feature immediately if flag is false
if (!features.enableBase) {
  throw new Error('Base features are disabled');
}

// Graceful degradation: show fallback if feature disabled
if (features.enableThemes) {
  return <ThemeSelector />;
} else {
  return <BasicUI />;
}
```

### Usage Examples

```typescript
import { getFeaturesConfig } from '@parel/core/config';

// Check a single flag
const features = getFeaturesConfig();
if (features.enableTrials) {
  // Show trials feature
}

// Check environment
if (features.environment === 'production') {
  // Production-only logic
}

// Conditional rendering
{features.enableThemes && <ThemeSelector />}
```

### Migration from Old Flags

**Old Pattern (deprecated):**
```typescript
import { getFlags } from '@parel/core/config';
const flags = getFlags();
if (flags.enableThemes) { ... }
```

**New Pattern (v0.42.21+):**
```typescript
import { getFeaturesConfig } from '@parel/core/config';
const features = getFeaturesConfig();
if (features.enableThemes) { ... }
```

---

## Status

- ✅ **Step 1:** Discovery complete (v0.42.17)
- ✅ **Step 2:** Design complete (v0.42.18)
- ✅ **Step 3:** Migration complete for gameplay/api/app/security/platform (v0.42.19)
- ✅ **Step 4:** UI design tokens migration complete (v0.42.20)
- ✅ **Step 5:** Feature flags migration complete (v0.42.21)
- ✅ **Step 6:** Validation engine + environment layering complete (v0.42.22)
- ✅ **Step 7:** Dynamic feature flags + plugin extensions complete (v0.42.23)
- ✅ **Step 8:** Legacy config removal + constant purge complete (v0.42.24)

---

## Legacy Config Removal

**As of v0.42.24, legacy config has been removed.**

All constants from `packages/core/config/constants.ts` have been migrated to the unified config system. The old constants file is kept for backward compatibility only and is marked as deprecated.

**Migration Guide:**
- Old: `XP_CONSTANTS.LEVEL_MULTIPLIER`
- New: `config.gameplay.xp.levelMultiplier`

- Old: `CURRENCY_CONSTANTS.STARTING_FUNDS`
- New: `config.gameplay.currency.startingFunds`

- Old: `TIMING_CONSTANTS.DEBOUNCE.search`
- New: `config.ui.timing.debounce.search`

See `packages/core/config/MAPPING_TABLE.md` for complete migration mapping.

**Last Updated:** v0.42.24  
**C6 Status:** 90% Complete - Legacy cleanup finished
