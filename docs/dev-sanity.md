# Dev Sanity Checks

Lightweight guardrails to prevent route regressions. Run before big PRs or after moving/adding API routes.

## Command

```bash
pnpm check:dev-sanity
```

## What it catches

| Check | What | Example failure |
|-------|------|-----------------|
| `check:routes` | Duplicate route files (route.ts shadowed by route.js) | `apps/web/app/api/news/route.ts` + `route.js` both exist |
| `check:dynamic-routes` | Conflicting dynamic param names under same parent | `app/api/news/[id]` and `app/api/news/[slug]` as siblings → Next.js "different slug names" error |

## When to run

- Before opening a big PR
- After adding or moving API routes in `apps/web/app/api/**`
- After copy-pasting route files (easy to get .ts + .js duplicates)

## Fixes

- **Duplicate routes:** Remove `.js`/`.jsx`; keep `.ts`/`.tsx` as canonical
- **Dynamic conflicts:** Merge into one route (e.g. `[id]` with `?by=slug` for slug lookup) or use static prefix (`by-slug/[slug]`)
