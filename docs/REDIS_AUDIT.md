# Redis Audit Report

## 1. Where Redis Client is Created

| File | Client Type | Env Vars | Notes |
|------|-------------|----------|-------|
| `packages/redis/src/client.ts` | ioredis | REDIS_URL, REDIS_DISABLED | Centralized; returns null when disabled. Has error handler. |
| `apps/web/lib/realtime.ts` | ioredis (pub + sub) | REDIS_URL, hasRedis | Own clients; lazy init; has error handlers. |
| `apps/web/lib/broker.ts` | ioredis (pub + sub) | REDIS_URL | Own clients; lazy init; checks REDIS_URL only. |
| `apps/web/lib/queue/connection.ts` | ioredis | REDIS_URL, hasRedis | BullMQ connection. Proxy throws if conn null. |
| `apps/web/lib/queue.ts` | ioredis | REDIS_URL, hasRedis | Run-queue (BullMQ). Separate conn. |
| `apps/web/lib/jobs/index.ts` | ioredis | REDIS_URL, hasRedis | Scheduler queue (BullMQ). Separate conn. |
| `apps/web/lib/middleware/culturalFilter.ts` | ioredis | REDIS_URL | Own client; no REDIS_DISABLED check. |
| `apps/web/lib/ai/context.ts` | ioredis | REDIS_URL, hasRedis | Own client; cache for AI context. |
| `apps/web/lib/performance/cache.ts` | ioredis | REDIS_URL | Own client; has error handler. |
| `apps/web/app/api/events/join/route.ts` | ioredis | REDIS_URL | Own client; cache invalidation only. |
| `apps/web/lib/security/rateLimit.ts` | **Upstash Redis (REST)** | UPSTASH_REDIS_REST_* | NOT ioredis; no 6379 connection. |

**Note:** `apps/web/lib/auth/rateLimit.ts` uses Prisma (FailedLoginAttempt) only—no Redis.

**Finding:** `presence/ping` imports `checkPresenceRateLimit` from `lib/security/rateLimit` but that export does not exist in the file—likely a bug (missing export or wrong import).

---

## 2. Features/Modules That Depend on Redis

| Module | Purpose | Redis ops | Fallback |
|--------|---------|-----------|----------|
| **@parel/redis** | Shared client for cache/locks | get, set, del | memoryAdapter when null |
| **events/today** | Cache "today's event" by region | get, set | DB if no cache; graceful |
| **presence** | Online count (ZSET) | zadd, zremrangebyscore, zcount | Returns false/null when off |
| **realtime** | Pub/sub for xp:update, etc. | publish | Local EventEmitter only |
| **broker** | Event broker (message:new, etc.) | publish, subscribe | Local emitter only |
| **queue/connection** | BullMQ (question-gen, scheduler) | BullMQ ops | Throws when no conn |
| **culturalFilter** | Cache regional filters | get, set, del | Local Map cache |
| **ai/context** | Cache AI context by region | get, set, del | DB if no cache |
| **performance/cache** | API response cache | get, setex, sadd, etc. | null = no cache |
| **events/join** | Invalidate event:today cache | del | No-op if no redis |
| **packages/core cache** | cacheGet/cacheSet (story, etc.) | get, set, del | null = no cache |
| **qotdService** | Uses performance/cache | — | Via performance layer |

---

## 3. Critical Path Analysis (login → play → answer → report)

| Endpoint | Uses Redis? | Impact if Redis off |
|----------|-------------|---------------------|
| `/api/health` | No (reads hasRedis from env) | None |
| `/api/init` | No | None |
| `/api/auth/login` | No (Prisma rate limit) | None |
| `/api/flow/start` | No | None |
| `/api/flow/answer` | Yes—`publishEvent` (realtime) | Degraded: no cross-tab XP push; local event bus works |
| `/api/flow/report` | No | None |

**Verdict:** Redis is **not required** for the core Alpha loop. Flow works without it.

---

## 4. Impact if Redis Off (per module)

| Module | Impact |
|--------|--------|
| events/today | **None** — falls back to DB; slightly slower |
| presence | **None** — getOnlineCount returns null; UI shows "—" or hides |
| realtime | **Degraded** — cross-tab real-time updates lost; in-process works |
| broker | **Degraded** — same as realtime |
| queue (BullMQ) | **Breaks** if code touches queue when hasRedis=false. questionGen.worker throws on connection proxy. |
| culturalFilter | **None** — has local Map cache |
| ai/context | **None** — falls back to DB |
| performance/cache | **None** — returns null, fetcher runs |
| events/join | **None** — invalidateToday no-op |
| packages/core cache | **None** — cacheGet returns null |
| packages/story | **None** — cacheGet/set return null/ok; story works |

---

## 5. Recommendations

| Module | Recommendation |
|--------|----------------|
| packages/redis | **Keep** — already gated; central place for client |
| events/today | **Keep** — uses @parel/redis; graceful |
| presence | **Keep** — uses @parel/redis; graceful |
| realtime | **Disable** — wire to hasRedis; avoid creating clients when off |
| broker | **Disable** — check hasRedis before init |
| queue/connection | **Disable** — return no-op proxy when !hasRedis instead of throw |
| culturalFilter | **Disable** — respect REDIS_DISABLED; use local cache only |
| ai/context | **Keep** — already checks hasRedis |
| performance/cache | **Disable** — respect REDIS_DISABLED |
| events/join | **Disable** — use @parel/redis or skip when disabled |

---

## 6. Proposed Implementation Plan

### A. Minimal steps to disable Redis in dev (no spam)

1. **Default REDIS_DISABLED in dev**  
   In `apps/web/lib/env.ts` or `.env.example`: when `NODE_ENV=development` and `REDIS_URL` unset, treat as `REDIS_DISABLED=true` (or document that devs should set it).

2. **Wire all ioredis creators to centralized gate**  
   - `lib/realtime.ts`: Guard init with `!hasRedis` (already has; ensure REDIS_URL not used when disabled).  
   - `lib/broker.ts`: Add `hasRedis` check before creating clients.  
   - `lib/middleware/culturalFilter.ts`: Add `REDIS_DISABLED` / `!hasRedis` guard; never create client when disabled.  
   - `lib/performance/cache.ts`: Same guard.  
   - `app/api/events/join/route.ts`: Use `@parel/redis` or skip when `!hasRedis`.

3. **Fix queue/connection proxy**  
   When `!hasRedis`, export a no-op proxy that returns undefined for BullMQ calls instead of throwing. `questionGenQueue`, `schedulerQueue`, `runQueue` already handle null via Proxy—ensure `getConnection()` returns null and no code path throws.

4. **Add error handlers everywhere**  
   Any remaining `new Redis()` must have `client.on('error', ...)` so ECONNREFUSED does not become unhandled. Use `logRedisErrorOnce` from `packages/redis`.

5. **logOnce for connection errors**  
   Ensure `logRedisErrorOnce` is used for all Redis error handlers so each process logs at most once.

### B. Optional: full removal (if safe)

- **Not recommended for Alpha.** Redis provides cache, presence, and realtime; removal would require replacing with DB or in-memory equivalents.
- If removing: start with broker/realtime (replace with local-only), then performance/cache (in-memory), then presence (remove or DB-backed). BullMQ jobs (questionGen, scheduler) need Redis for workers—keep or replace with a different job system.

---

## Appendix: Env Vars Summary

| Var | Purpose |
|-----|---------|
| REDIS_URL | ioredis connection string (e.g. redis://localhost:6379) |
| REDIS_DISABLED | When true/1, do not create ioredis clients |
| UPSTASH_REDIS_REST_URL | Upstash REST API (lib/security/rateLimit)—separate from ioredis |
| UPSTASH_REDIS_REST_TOKEN | Upstash REST token |
