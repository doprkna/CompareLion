# API Sanity Report

Generated: {{timestamp}}

## Overview

This report provides a comprehensive audit of all API routes in the PAREL codebase, including their methods, models, FE usage, and schema alignment.

## Summary Statistics

- **Total Routes**: {{totalRoutes}}
- **Models Used**: {{modelsUsed}}
- **Orphaned Models**: {{orphanedModels}}
- **Routes without FE**: {{routesWithoutFe}}

## Routes by HTTP Method

{{#routesByMethod}}
- **{{method}}**: {{count}}
{{/routesByMethod}}

## Routes by System

{{#routesBySystem}}
### {{system}} ({{count}} routes)

{{#routes}}
- **{{path}}** - {{methods}}
  - Models: {{models}}
  - Status: {{status}}
  {{#hasTodo}}âš ï¸ Has TODO/FIXME{{/hasTodo}}
  {{#hasPlaceholder}}ðŸ·ï¸ Has placeholder{{/hasPlaceholder}}

{{/routes}}
{{/routesBySystem}}

## Orphaned Models

Models defined in schema but never referenced in API routes:

{{#orphanedModels}}
- {{model}}
{{/orphanedModels}}

## Routes without FE Usage

These routes are not called from any frontend code:

{{#routesWithoutFe}}
- {{route}}
{{/routesWithoutFe}}

## Notes

- Generated via `pnpm tsx scripts/api-map.ts`
- FE usage detection uses regex matching for `fetch('/api/...)` patterns
- Orphaned models are defined in `packages/db/schema.prisma` but never used in API routes
- Status meanings:
  - `ok`: Route has FE usage and models are valid
  - `missing-model`: Route references non-existent model (not detected in this audit)
  - `no-fe`: Route has no frontend usage detected

---

For full JSON data, see `logs/api-map-{{timestamp}}.json`