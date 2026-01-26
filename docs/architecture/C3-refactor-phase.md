# C3 â€” v0.27 Stability & Refactor Phase

## Purpose

This document defines the refactor plan for v0.27 Stability & Refactor Phase. It provides a refactor map, conflict zones, sequencing plan, API envelope conventions, analytics schema, and multiplayer-safe data structure rules for structural planning.

---

# v0.27 Stability & Refactor Phase â€” Planning Document

## 1. Refactor Map

### Module Boundaries to Consolidate

**Core Modules:**
- **Flow Module** â€” Challenge flow, state transitions, completion logic
- **Social Module** â€” Profiles, follows, activity feeds, interactions
- **Progression Module** â€” XP, levels, streaks, reputation, discovery points
- **Narrative Module** â€” Lore, stories, story cycles, choices, branching
- **World Module** â€” Events, locations, exploration, world state
- **UI-Kit Module** â€” Reusable components, primitives, layouts
- **Utils Module** â€” Shared helpers, formatters, validators, constants

**Supporting Modules:**
- **API Client Module** â€” Centralized fetch logic, request/response handling
- **State Module** â€” Global state management, caching, synchronization
- **Analytics Module** â€” Event tracking, telemetry, logging

### Duplicated Logic Across Modules

**State Management:**
- Challenge state tracking (flow vs progression vs social)
- User session state (auth vs profile vs social)
- Cache invalidation patterns (inconsistent across modules)
- Optimistic update patterns (different implementations)

**Data Fetching:**
- Fetch hooks duplicated per module
- Error handling patterns inconsistent
- Loading state management varies
- Retry logic implemented differently

**DTO Shapes:**
- Challenge representations differ (flow vs social vs progression)
- User profile shapes inconsistent (profile vs social vs world)
- Event/timeline item formats vary
- Pagination responses handled differently

**Helper Functions:**
- Date/time formatting duplicated
- Progress calculation logic repeated
- Validation rules scattered
- Permission checks implemented multiple times

### Backend Areas Needing Cleanup

**API Envelopes:**
- Response formats inconsistent (some wrapped, some raw)
- Error responses vary in structure
- Pagination metadata formats differ
- Success/error status codes inconsistent

**DTO Consistency:**
- Challenge DTOs differ across endpoints
- User DTOs vary by context
- Event DTOs inconsistent
- Missing shared DTO base classes/interfaces

**Validation Patterns:**
- Validation logic scattered (routes vs services vs DTOs)
- Error messages inconsistent
- Validation rules duplicated
- Missing centralized validation middleware

**Query Patterns:**
- Database queries inconsistent (some raw, some ORM)
- N+1 query patterns exist
- Missing query optimization patterns
- Transaction boundaries unclear

### Frontend Areas Needing Cleanup

**Hooks:**
- Data fetching hooks duplicated per feature
- State management hooks inconsistent
- Form handling hooks vary
- Missing shared hook patterns

**Component Structure:**
- Component organization inconsistent (feature-based vs type-based)
- Props interfaces duplicated
- Component composition patterns vary
- Missing shared component primitives

**UI Primitives:**
- Button variants inconsistent
- Form inputs styled differently
- Card/container patterns vary
- Typography scales inconsistent

**Data Fetch Patterns:**
- Some components fetch directly, others use hooks
- Cache invalidation strategies differ
- Loading/error states handled inconsistently
- Optimistic updates implemented differently

---

## 2. Conflict Zones (Hotspots)

### High Risk Zones

**Auth System:**
- **Why risky:** Core security, session management, token handling
- **Risk factors:** Changes can break all authenticated requests, security implications
- **Refactor approach:** Isolate, test thoroughly, staged rollout

**Flow Service (Challenge Completion Logic):**
- **Why risky:** Core business logic, complex state transitions, payment/XP integration
- **Risk factors:** Breaks challenge completion, affects progression, user-facing impact
- **Refactor approach:** Extract to service layer, comprehensive test coverage, feature flags

**Prisma Layering:**
- **Why risky:** Database access layer, schema dependencies, migration complexity
- **Risk factors:** Schema changes affect all modules, migration rollback complexity
- **Refactor approach:** Define clear boundaries, avoid schema changes during refactor

**Session/State Persistence:**
- **Why risky:** User experience, data loss risk, sync issues
- **Risk factors:** Can cause data loss, break user flows, create sync problems
- **Refactor approach:** Maintain backward compatibility, gradual migration

### Medium Risk Zones

**Legacy Query Patterns:**
- **Why risky:** Performance implications, N+1 queries, data consistency
- **Risk factors:** Performance degradation, data inconsistency, hard to debug
- **Refactor approach:** Identify patterns, optimize incrementally, monitor performance

**Real-time Feed Systems:**
- **Why risky:** Performance, race conditions, synchronization complexity
- **Risk factors:** Feed inconsistencies, performance issues, user confusion
- **Refactor approach:** Define clear event ordering, implement conflict resolution

**Story State Management:**
- **Why risky:** Complex branching logic, state transitions, user progress
- **Risk factors:** Story progress loss, branching errors, user frustration
- **Refactor approach:** State machine validation, comprehensive test coverage

**Payment/Transaction Logic:**
- **Why risky:** Financial implications, compliance, audit requirements
- **Risk factors:** Payment failures, compliance issues, audit trail problems
- **Refactor approach:** Isolate, maintain audit logs, extensive testing

### Low Risk Zones

**UI Component Library:**
- **Why risky:** Visual consistency, but low functional risk
- **Risk factors:** Visual bugs, minor UX issues
- **Refactor approach:** Gradual migration, visual regression testing

**Utility Functions:**
- **Why risky:** Low risk, but high usage
- **Risk factors:** Breaking changes affect many modules
- **Refactor approach:** Maintain backward compatibility, deprecation path

**Analytics/Logging:**
- **Why risky:** Low functional risk, but data quality impact
- **Risk factors:** Lost analytics data, debugging difficulties
- **Refactor approach:** Dual-write during transition, validate data quality

---

## 3. Sequencing Plan

### Step 1: API Envelope Standardization (Foundation)
- **Theme:** Unify API response formats
- **Scope:** Define and implement consistent envelope structure
- **Can run in parallel:** No (blocks other work)
- **Risk:** Low (additive, backward compatible)

### Step 2: DTO Consolidation (Data Layer)
- **Theme:** Create shared DTO base classes and standardize shapes
- **Scope:** Define common DTO patterns, create base classes
- **Can run in parallel:** With Step 1 (after envelope defined)
- **Risk:** Medium (requires coordination with Step 1)

### Step 3: API Client Module Extraction (Frontend Foundation)
- **Theme:** Centralize fetch logic, error handling, retry patterns
- **Scope:** Extract shared API client, standardize hooks
- **Can run in parallel:** After Step 1 (needs envelope format)
- **Risk:** Low (can be gradual migration)

### Step 4: State Management Consolidation (State Layer)
- **Theme:** Unify state management patterns, cache strategies
- **Scope:** Consolidate state logic, standardize cache invalidation
- **Can run in parallel:** After Step 3 (needs API client)
- **Risk:** Medium (affects many components)

### Step 5: Validation Pattern Unification (Backend)
- **Theme:** Centralize validation logic, standardize error responses
- **Scope:** Create validation middleware, standardize rules
- **Can run in parallel:** After Step 2 (needs DTOs)
- **Risk:** Medium (affects all endpoints)

### Step 6: Component Primitive Library (UI Foundation)
- **Theme:** Consolidate UI components, standardize patterns
- **Scope:** Create shared component library, standardize props
- **Can run in parallel:** Independent (UI layer)
- **Risk:** Low (visual only, gradual migration)

### Step 7: Module Boundary Enforcement (Architecture)
- **Theme:** Enforce module boundaries, reduce cross-module dependencies
- **Scope:** Define module interfaces, refactor dependencies
- **Can run in parallel:** After Steps 3-6 (needs foundations)
- **Risk:** High (architectural changes)

### Step 8: Performance & Query Optimization (Backend)
- **Theme:** Optimize database queries, eliminate N+1 patterns
- **Scope:** Refactor query patterns, add optimizations
- **Can run in parallel:** After Step 5 (needs validation patterns)
- **Risk:** Medium (performance critical)

**Execution Order:**
1. Step 1 (blocks others)
2. Steps 2-3 (can run in parallel after Step 1)
3. Steps 4-5 (can run in parallel after Steps 2-3)
4. Step 6 (independent)
5. Steps 7-8 (can run in parallel after Steps 4-5)

---

## 4. API Envelope Convention

### Success Response Format

```
{
  "success": true,
  "data": <response payload>,
  "meta": {
    "timestamp": "ISO 8601",
    "requestId": "uuid",
    "version": "api version"
  },
  "pagination": {  // optional, only for paginated responses
    "page": number,
    "pageSize": number,
    "total": number,
    "hasMore": boolean
  }
}
```

### Error Response Format

```
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {  // optional, for validation errors
      "field": ["error message"]
    },
    "requestId": "uuid",
    "timestamp": "ISO 8601"
  }
}
```

### Standard Error Codes

- `VALIDATION_ERROR` â€” Input validation failed
- `AUTHENTICATION_ERROR` â€” Authentication required/failed
- `AUTHORIZATION_ERROR` â€” Insufficient permissions
- `NOT_FOUND` â€” Resource not found
- `CONFLICT` â€” Resource conflict (e.g., duplicate)
- `RATE_LIMIT_ERROR` â€” Rate limit exceeded
- `INTERNAL_ERROR` â€” Server error
- `SERVICE_UNAVAILABLE` â€” External service unavailable

### Pagination Rules

- Default page size: 20
- Maximum page size: 100
- Page numbers start at 1
- Cursor-based pagination for real-time feeds (optional)
- Always include `hasMore` boolean

### Validation Rules

- All inputs validated at API boundary
- Validation errors return `VALIDATION_ERROR` with `details` object
- Field-level errors in `details` object
- Use consistent field naming (camelCase)

### Debug Flags

- Include `requestId` in all responses (for debugging)
- Optional `debug` query parameter for additional info (dev only)
- Never expose internal errors in production

---

## 5. Analytics/Event Schema (Lightweight)

### Conceptual Event Structure

```
Event {
  type: string (event type identifier)
  actor: {
    userId: string
    sessionId: string (optional)
  }
  context: {
    timestamp: ISO 8601
    source: string (UI component / API endpoint / background job)
    userAgent: string (optional)
    ipAddress: string (optional, hashed)
  }
  metadata: {
    [key: string]: any (event-specific data)
  }
}
```

### 10 Sample Event Types

1. `challenge.started` â€” User started a challenge
   - Metadata: `challengeId`, `challengeType`, `source`

2. `challenge.completed` â€” User completed a challenge
   - Metadata: `challengeId`, `xpEarned`, `timeTaken`, `completionMethod`

3. `challenge.abandoned` â€” User abandoned a challenge
   - Metadata: `challengeId`, `progress`, `reason` (optional)

4. `story.progressed` â€” User progressed in a story
   - Metadata: `storyId`, `chapterId`, `choiceMade` (optional)

5. `lore.discovered` â€” User discovered new lore
   - Metadata: `loreId`, `discoveryMethod`, `location` (optional)

6. `social.follow` â€” User followed another user
   - Metadata: `targetUserId`, `source`

7. `social.interaction` â€” User interacted with social content
   - Metadata: `interactionType` (like/comment/share), `targetId`, `targetType`

8. `progression.levelUp` â€” User leveled up
   - Metadata: `newLevel`, `xpTotal`, `unlocks` (array)

9. `event.joined` â€” User joined a world event
   - Metadata: `eventId`, `eventType`, `participationMethod`

10. `exploration.locationVisited` â€” User visited a location
    - Metadata: `locationId`, `discoveries` (array), `timeSpent`

### Event Collection Rules

- All events include `actor.userId` (if authenticated)
- Events include `context.timestamp` (server-side when possible)
- Sensitive data excluded from metadata
- Events are immutable (no updates, only new events)
- Events can be batched for performance

---

## 6. Multiplayer-Safe Data Structures

### Entities Requiring Conflict-Safe Representation

**Feeds (Activity/Timeline):**
- **Race condition:** Multiple users posting simultaneously
- **Solution:** Event sourcing with timestamps + sequence numbers
- **Rules:** Order by `(timestamp, sequenceNumber)`, handle ties consistently

**Events (World Events):**
- **Race condition:** Concurrent participation updates
- **Solution:** Optimistic locking with version numbers
- **Rules:** Check `version` before update, retry on conflict

**Story States:**
- **Race condition:** Multiple choice selections, branching conflicts
- **Solution:** State machine with transition validation
- **Rules:** Validate transitions, reject invalid states, last-write-wins with conflict detection

**Leaderboards:**
- **Race condition:** Concurrent score updates
- **Solution:** Atomic increment operations, eventual consistency
- **Rules:** Use atomic operations, periodic recalculation, cache with TTL

**Streaks:**
- **Race condition:** Multiple challenge completions updating streak
- **Solution:** Date-based locking, single source of truth
- **Rules:** Lock by date, validate completion order, handle timezone edge cases

**Progression (XP/Levels):**
- **Race condition:** Concurrent XP awards
- **Solution:** Atomic increment, idempotent operations
- **Rules:** Use transaction IDs for idempotency, atomic increments, validate totals

### Race-Free State Transition Rules

**General Principles:**
1. Use version numbers or timestamps for optimistic locking
2. Validate state transitions before applying
3. Use atomic operations for numeric updates
4. Implement idempotency for critical operations
5. Handle conflicts with retry logic or conflict resolution

**Conflict Resolution Strategies:**
- **Last-write-wins:** For non-critical data (preferences, settings)
- **First-write-wins:** For critical data (payments, achievements)
- **Merge:** For additive data (discoveries, collections)
- **Reject:** For invalid transitions (story choices, invalid states)

**Transaction Boundaries:**
- Group related updates in transactions
- Keep transactions short to reduce lock contention
- Use read-committed isolation level (default)
- Use serializable only when necessary (financial operations)

**Event Ordering:**
- Use server-side timestamps for ordering
- Include sequence numbers for events in same millisecond
- Handle clock skew with NTP synchronization
- Use logical clocks for distributed systems (if needed)

**Caching Strategy:**
- Cache with TTL for frequently accessed data
- Invalidate cache on updates (write-through or write-behind)
- Use cache versioning for conflict detection
- Implement cache warming for critical data

---

## Summary

This refactor plan establishes:
- Clear module boundaries and consolidation targets
- Identified conflict zones with risk levels
- Safe sequencing with parallel execution opportunities
- Unified API envelope conventions
- Lightweight analytics event schema
- Multiplayer-safe data structure rules

Ready for review before implementation begins.
