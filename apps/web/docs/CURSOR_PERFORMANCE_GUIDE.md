# Cursor Performance Guide

**Version:** 0.30.5  
**Date:** 2025-11-01

## Overview

This guide documents Cursor efficiency optimizations implemented during the 0.30.x maintenance branch to reduce token load, indexing lag, and build overhead.

## Configuration

### `.cursor/config.json`

Cursor configuration with indexing and memory limits:

```json
{
  "indexing": {
    "exclude": [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/logs/**",
      "**/coverage/**",
      "**/.vercel/**",
      "**/public/**",
      "**/docs_archive/**",
      "**/*.log",
      "**/*.pdf"
    ],
    "maxFileSizeKB": 400
  },
  "memory": {
    "limitMB": 256
  },
  "performance": {
    "enableTurbo": true,
    "skipHeavyModels": true
  }
}
```

**Benefits:**
- Skips large generated folders (node_modules, .next, dist)
- Limits file size indexing to 400KB
- Memory cap at 256MB for Cursor process
- Turbo mode enabled for faster operations

### Environment Flags

**`.env.local` entries:**

```
# Cursor Efficiency Mode (v0.30.5)
DEV_DISABLE_INDEXING=true
DEV_DISABLE_HEAVY_MODELS=true
DEBUG_VERBOSE=false
```

**Usage in code:**
```typescript
// Skip heavy model scanning
if (process.env.DEV_DISABLE_HEAVY_MODELS === 'true') {
  return { models: [] };
}

// Verbose logging guard
if (process.env.DEBUG_VERBOSE === 'true') {
  console.log('Verbose message');
}
```

## Dev Script Optimization

**Updated `apps/web/package.json`:**

```json
{
  "scripts": {
    "dev": "next dev --turbo --no-lint"
  }
}
```

**Benefits:**
- `--turbo`: Uses Next.js Turbo for faster builds
- `--no-lint`: Skips ESLint during dev (run separately when needed)

**Run lint separately:**
```bash
pnpm lint
```

## Chunked Script Execution

Heavy scripts (seed, audit, map) now process models in batches:

**Pattern:**
```typescript
const chunkSize = 25;
for (let i = 0; i < models.length; i += chunkSize) {
  const chunk = models.slice(i, i + chunkSize);
  const results = await Promise.allSettled(
    chunk.map(model => processModel(model))
  );
  // Process results...
}
```

**Benefits:**
- Prevents memory overflow
- Reduces Cursor token load
- Allows graceful error handling per chunk

## Logging Reduction

**Environment guard for verbose logs:**

```typescript
const DEBUG_VERBOSE = process.env.DEBUG_VERBOSE === 'true';

function shouldLog(msg: string) {
  if (DEBUG_VERBOSE) console.log(msg);
}

// In scripts
shouldLog('ðŸŒ± Starting seed...');
```

**Default:** `DEBUG_VERBOSE=false` (no verbose logs)

**Enable verbose:** Set `DEBUG_VERBOSE=true` in `.env.local`

## File Size Limits

**Oversized files (optional split):**

Files > 500 lines that are reused often can be split:

```
lib/config/constants/
  â”œâ”€â”€ index.ts (exports)
  â”œâ”€â”€ xp.ts
  â”œâ”€â”€ economy.ts
  â”œâ”€â”€ rewards.ts
  â””â”€â”€ colors.ts
```

**Note:** Not required - only if file becomes unmanageable.

## Verification

### Cursor Load Time
- Target: < 20 seconds
- Check: Cursor startup in status bar

### CPU/RAM Stability
- Monitor during `pnpm dev`
- Should remain stable during dev server

### Large Script Execution
- `pnpm tsx scripts/db-integrity-check.ts` - should complete without choking
- `pnpm tsx scripts/api-map.ts` - should generate report smoothly
- `pnpm db:seed` - should seed without memory issues

### Build with Flags
```bash
# Test build with flags
pnpm run build
```

## Performance Targets

- âœ… Cursor load time < 20s
- âœ… CPU/RAM stable during dev
- âœ… Large scripts execute without choking
- âœ… Build passes with flags toggled
- âœ… `console.log` usage < 10 files (allowed: debug-only)

## Temporary Setup

**Important:** This setup is for 0.30.x maintenance branch only.

**Before public release:**
- Review `.cursor/config.json` settings
- Remove temporary flags from `.env.local` if needed
- Verify build without `--no-lint` flag

**Commit tag:** Always commit config changes with "âš™ï¸ Cursor Opt" tag.

## Troubleshooting

### Cursor Still Slow?
1. Check `.cursor/config.json` exists and is valid
2. Verify excluded folders in indexing.exclude
3. Check file size limits (maxFileSizeKB)
4. Restart Cursor after config changes

### Scripts Still Choking?
1. Verify chunk size (default: 25)
2. Check `DEV_DISABLE_HEAVY_MODELS` flag
3. Increase chunk size if needed (not recommended)

### Build Failing?
1. Run lint separately: `pnpm lint`
2. Check for TypeScript errors: `pnpm typecheck`
3. Verify flags don't break production builds

## Notes

- Keep file count constant where possible
- Avoid simultaneous refactor of >3 core files
- Chunked execution pattern is reusable
- Environment flags can be removed after maintenance phase