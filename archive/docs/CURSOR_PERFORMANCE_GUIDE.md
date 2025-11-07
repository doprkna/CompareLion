# Cursor Performance Guide

**Version:** 0.30.5  
**Date:** 2025-11-01

## Overview

This guide documents Cursor efficiency optimizations implemented during the 0.30.x maintenance branch to reduce token load, indexing lag, and build overhead.

## Configuration

### `.cursor/config.json`

Cursor configuration with indexing and memory limits. See the file for full details.

### Environment Flags

**`.env.local` entries:**

```
DEV_DISABLE_INDEXING=true
DEV_DISABLE_HEAVY_MODELS=true
DEBUG_VERBOSE=false
```

### Dev Script Optimization

**Updated `apps/web/package.json`:**
```json
{
  "scripts": {
    "dev": "next dev --turbo --no-lint"
  }
}
```

Run lint separately: `pnpm lint`

## Performance Targets

- Cursor load time < 20s
- CPU/RAM stable during dev
- Large scripts execute without choking
- Build passes with flags toggled

## Notes

- Temporary setup: 0.30.x maintenance branch only
- Remove temporary flags before public release
- Always commit config changes with "âš™ï¸ Cursor Opt" tag