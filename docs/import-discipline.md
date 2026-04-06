# Import Discipline — Quick Reference

Lightweight guide for keeping imports disciplined after alias and public-API cleanup.

## When to Use `@/...`

Use the `@/` alias for **app-level code** inside `apps/web`:

- `@/components/...` — app components
- `@/lib/...` — app libraries, hooks, utils
- `@/lib/hooks` — shared hooks barrel
- `@/app/...` — Next.js app router paths

**Prefer** `@/` over deep relative imports like `../../../../components/...`.

## When to Use `@parel/*`

Use package names for **workspace packages** — always via their **public entrypoints**:

| Package | Use | Do Not Use |
|---------|-----|------------|
| `@parel/db` | `@parel/db/client`, `@parel/db/leaf` | `@parel/db/src/client`, `@parel/db/dist/client` |
| `@parel/core` | `@parel/core/config/unified`, `@parel/core/logger`, `@parel/core/hooks` | `@parel/core/src/*` |
| `@parel/ui` | `@parel/ui` | `@parel/ui/atoms`, `@parel/ui/src/*` |

Import only what the package exports publicly. Check `package.json` `exports` for valid paths.

## Forbidden Patterns

ESLint enforces these (see `apps/web/.eslintrc.json`):

- **`@parel/*/src/**`** — never import package internals via `src/`
- **`@parel/*/dist/**`** — never import build output via `dist/`

## Public API Per Module

Each package defines public entrypoints (e.g. `./client`, `./leaf`, `./config/unified`). Consumers must use those, not reach into `src/` or `dist/` — this keeps boundaries clear and allows internal refactors without breaking consumers.

## Exceptions

- **Within the same package:** Relative imports inside a package (e.g. `packages/core` importing from `packages/core/utils/...`) are fine.
- **Archive:** Archived code is excluded from lint enforcement.
- **Build scripts:** Internal package build tooling may use relative paths within that package.

## Quick Checklist

- ✅ Use `@/` for app code instead of deep `../`
- ✅ Use `@parel/db/client` not `@parel/db/src/client`
- ✅ Use `@parel/core/logger` not `@parel/core/src/...`
- ❌ Do not import `**/src/**` or `**/dist/**` from `@parel/*` packages
