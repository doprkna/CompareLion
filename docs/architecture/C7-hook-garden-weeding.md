# C7 â€” Hook Garden Weeding (Hook Simplification)

## Purpose

This document defines the plan for consolidating hooks into a unified, simplified set. It provides a hook inventory, redundancy audit, unified hook set, naming rules, consolidation rules, feature hook guidelines, migration strategy, and risk map for structural planning.

---

# C7 â€” Hook Garden Weeding (Hook Simplification) â€” Planning Document

## 1. Hook Inventory (Conceptual)

### Data-Fetching Hooks
- `useChallenge`, `useUserProfile`, `useActivityFeed`, `useLore`, `useStory`, `useEvent`, `useLeaderboard`, `useStreak`, `useXP`, `useNotifications`

### Local State Helpers
- `useBoolean`, `useToggle`, `useCounter`, `useInput`, `useForm`, `useLocalStorage`, `useSessionStorage`, `usePrevious`, `useDebounce`, `useThrottle`

### Lifecycle Helpers
- `useMount`, `useUnmount`, `useUpdate`, `useEffectOnce`, `useIsMounted`, `useDidMount`, `useWillUnmount`, `useUpdateEffect`, `useDeepCompareEffect`, `useShallowCompareEffect`

### UI Behavior Helpers
- `useClickOutside`, `useFocus`, `useHover`, `useMediaQuery`, `useWindowSize`, `useScroll`, `useIntersection`, `useVisibility`, `useModal`, `useTooltip`

### Feature-Specific Hooks
- `useChallengeFlow`, `useSocialFeed`, `useProgression`, `useNarrative`, `useWorldEvents`, `useDiscovery`, `useRecommendations`, `useStreakLogic`, `useXPCalculation`, `useStoryChoices`

---

## 2. Redundancy & Anti-Pattern Audit

### Anti-Pattern 1: Trivial Hook Duplication
- **Problem:** Multiple implementations of `useBoolean`, `useToggle`, `useCounter`
- **Impact:** Inconsistent APIs, maintenance overhead, confusion
- **Example:** Three different `useToggle` hooks with different return signatures

### Anti-Pattern 2: Inconsistent Return Signatures
- **Problem:** Similar hooks return different shapes (e.g., `[value, setValue]` vs `{ value, setValue }`)
- **Impact:** Developer confusion, refactoring difficulty, type errors
- **Example:** Some data hooks return `{ data, loading, error }`, others return `[data, loading, error]`

### Anti-Pattern 3: Multi-Purpose Hooks Doing Too Much
- **Problem:** Hooks that handle fetching, caching, error handling, and UI state
- **Impact:** Hard to test, hard to reuse, violates single responsibility
- **Example:** Hook that fetches data, manages loading state, handles errors, and updates UI

### Anti-Pattern 4: Hooks Leaking Implementation Details
- **Problem:** Hooks expose internal implementation (axios, fetch, specific APIs)
- **Impact:** Tight coupling, hard to swap implementations, testing difficulties
- **Example:** Hook that exposes axios instance or specific API endpoint structure

### Anti-Pattern 5: Hooks Tightly Coupled to Features
- **Problem:** Generic-sounding hooks contain feature-specific logic
- **Impact:** Cannot reuse across features, creates false sense of reusability
- **Example:** `useData` hook that only works for challenges, not other entities

### Anti-Pattern 6: Duplicate Event Listener Patterns
- **Problem:** Multiple hooks implementing window resize, scroll, click outside
- **Impact:** Performance issues (multiple listeners), inconsistent behavior
- **Example:** Three different `useWindowSize` hooks with different update frequencies

### Anti-Pattern 7: Inconsistent Error Handling
- **Problem:** Data-fetching hooks handle errors differently
- **Impact:** Inconsistent UX, hard to debug, missing error states
- **Example:** Some hooks throw errors, others return error state, others silently fail

### Anti-Pattern 8: Missing Loading States
- **Problem:** Some data hooks don't expose loading state
- **Impact:** Cannot show loading UI, poor UX, race conditions
- **Example:** Hook returns data but no indication if it's still loading

### Anti-Pattern 9: No Cache Invalidation Strategy
- **Problem:** Data hooks don't coordinate cache invalidation
- **Impact:** Stale data, inconsistent UI, unnecessary refetches
- **Example:** Multiple hooks fetching same data without cache coordination

### Anti-Pattern 10: Lifecycle Hook Confusion
- **Problem:** Multiple ways to handle mount/unmount/update effects
- **Impact:** Inconsistent patterns, hard to reason about, bugs
- **Example:** `useMount`, `useDidMount`, `useEffectOnce` all doing similar things

### Anti-Pattern 11: Feature Hooks in Shared Locations
- **Problem:** Feature-specific hooks exported from shared hook library
- **Impact:** False dependencies, circular imports, tight coupling
- **Example:** `useChallengeFlow` exported from shared hooks, used only in challenge feature

### Anti-Pattern 12: Missing Type Safety
- **Problem:** Hooks not properly typed, causing runtime errors
- **Impact:** Type errors, poor DX, runtime bugs
- **Example:** Generic hooks without type parameters, `any` types everywhere

---

## 3. Unified Hook Set (Final Target)

### State Helpers

**`useToggle`**
- Single hook for boolean state with toggle function
- Handles both controlled and uncontrolled cases

**`useCounter`**
- Manages numeric counter state with increment/decrement/reset
- Supports min/max bounds

**`usePrevious`**
- Tracks previous value of any state
- Useful for comparison and diff logic

**`useLocalStorage`**
- Syncs state with localStorage
- Handles serialization, errors, and SSR

**`useSessionStorage`**
- Syncs state with sessionStorage
- Same patterns as localStorage hook

### Data-Fetching Hooks

**`useQuery`**
- Generic data-fetching hook bound to API client
- Returns `{ data, loading, error, refetch }`
- Handles caching, deduplication, and error states

**`useMutation`**
- Generic mutation hook for POST/PUT/DELETE
- Returns `{ mutate, loading, error }`
- Handles optimistic updates and cache invalidation

**`useInfiniteQuery`**
- Paginated data fetching with infinite scroll support
- Returns paginated data with `loadMore` function
- Handles cursor-based and offset-based pagination

### UI Behavior Hooks

**`useClickOutside`**
- Detects clicks outside element
- Handles cleanup and multiple elements

**`useFocus`**
- Manages focus state and focus management
- Supports focus trap and focus restoration

**`useHover`**
- Tracks hover state for element
- Handles mouse enter/leave events

**`useMediaQuery`**
- Reacts to media query changes
- Supports multiple breakpoints and SSR

**`useWindowSize`**
- Tracks window dimensions
- Debounced updates for performance

**`useScroll`**
- Tracks scroll position and direction
- Configurable throttling

**`useIntersection`**
- Intersection Observer wrapper
- Tracks element visibility in viewport

**`useVisibility`**
- Tracks page/document visibility
- Handles tab switching and background state

### System Hooks

**`useDebounce`**
- Debounces value changes
- Configurable delay, handles cleanup

**`useThrottle`**
- Throttles value changes
- Configurable interval, handles cleanup

**`useInterval`**
- Runs callback at interval
- Handles pause/resume and cleanup

**`useTimeout`**
- Runs callback after delay
- Handles cancellation and cleanup

**`useEventListener`**
- Generic event listener hook
- Handles window/document/element events, cleanup

---

## 4. Naming Rules

### Core Naming Convention
- All hooks must start with `use` prefix
- Use camelCase: `useToggle`, not `use-toggle` or `use_toggle`
- Be descriptive: `useWindowSize` not `useSize`
- Use verbs for actions: `useToggle`, `useFetch`, `useDebounce`
- Use nouns for state: `usePrevious`, `useWindowSize`

### Single Responsibility
- One hook does one thing well
- Avoid `useHandler` or `useHelper` (too vague)
- Avoid `useStuff` or `useThing` (not descriptive)
- Name reflects what the hook does, not how it's implemented

### Feature-Specific Hooks
- Must prefix with feature name: `useChallengeFlow`, `useSocialFeed`
- Cannot be generic-sounding: `useData` is forbidden if feature-specific
- Live at feature boundary, not in shared hooks
- Clear separation between shared and feature hooks

### Export Rules
- Never export hooks from deep internals
- Shared hooks exported from single entry point
- Feature hooks exported from feature boundary only
- No re-exports of internal implementation hooks

### Avoid Ambiguous Names
- `useData` is too generic (use `useQuery` or `useChallengeData`)
- `useHandler` is too vague (use `useClickHandler` or `useSubmitHandler`)
- `useHelper` is meaningless (be specific about what it helps with)
- `useUtils` is forbidden (split into specific hooks)

---

## 5. Consolidation Rules

### Merge Trivial Boolean Toggles
- Consolidate all `useBoolean`, `useToggle`, `useSwitch` into single `useToggle`
- Standardize return signature: `[value, toggle, setValue]`
- Support both controlled and uncontrolled usage
- Remove all duplicate implementations

### Consolidate Data-Fetching Wrappers
- Merge all axios/fetch wrappers into `useQuery` and `useMutation`
- Standardize return signature: `{ data, loading, error, refetch }`
- Use API client abstraction, not direct fetch/axios
- Remove feature-specific data hooks, use generic with typed parameters

### Unify Event Listeners
- Consolidate all event listener hooks into `useEventListener`
- Support window, document, and element events
- Handle cleanup consistently
- Remove duplicate resize/scroll/click implementations

### Unify Intersection Observers
- Consolidate all intersection observer hooks into `useIntersection`
- Standardize options and return values
- Handle cleanup and multiple observers
- Remove duplicate visibility/intersection hooks

### Extract Feature Logic from Generic Hooks
- Move feature-specific logic out of generic hooks
- Generic hooks provide primitives, features compose them
- Example: `useChallengeFlow` composes `useQuery` + `useToggle` + feature logic
- No feature logic in shared hooks

### Consolidate Lifecycle Hooks
- Standardize on React's `useEffect` with proper patterns
- Remove redundant `useMount`, `useUnmount` (use `useEffect` with empty deps)
- Keep `usePrevious` for comparison use cases
- Document lifecycle patterns instead of creating hooks

### Unify Form Hooks
- Consolidate form state management into single pattern
- Use `useForm` with consistent API
- Standardize validation and error handling
- Remove duplicate form hooks

---

## 6. Feature-Level Hook Guidelines

### Hook Location Rules
- All feature-specific hooks live at feature boundary
- Feature hooks exported from feature's hook index
- No feature hooks in shared hook library
- Clear separation between shared and feature code

### Cross-Feature Dependencies
- No cross-feature dependencies in hooks
- Feature hooks cannot import other feature hooks
- Shared hooks are the only cross-feature dependency
- Features communicate through shared hooks or API, not direct hook imports

### Composition Pattern
- Feature hooks compose shared hooks, don't duplicate them
- Example: `useChallengeFlow` uses `useQuery` + `useToggle` + challenge logic
- No reimplementation of shared hook functionality
- Feature hooks add feature-specific logic only

### Global State Management
- Feature hooks must not manage global state directly
- Use shared state management (context, store) for global state
- Feature hooks can consume global state, not manage it
- Clear boundaries between local and global state

### Hook Boundaries
- Feature hooks are the boundary between feature and shared code
- Feature hooks can use shared hooks and feature services
- Feature hooks cannot use other feature's services directly
- API calls go through shared API client, not feature-specific clients

---

## 7. Migration Strategy

### Step 1: Comprehensive Hook Audit
- Identify all hooks across codebase
- Catalog hooks by category and usage
- Map hook dependencies and relationships
- Document current hook APIs and behaviors
- Can run in parallel: Yes (multiple auditors)

### Step 2: Classify Hooks by Category
- Categorize hooks (state/data/UI/system/feature)
- Identify duplicates and near-duplicates
- Map hooks to unified hook set
- Document consolidation opportunities
- Can run in parallel: After Step 1

### Step 3: Choose Canonical Hooks
- Select canonical implementation for each hook type
- Define standard APIs and return signatures
- Document hook contracts and behaviors
- Create type definitions for all hooks
- Can run in parallel: No (requires Step 2)

### Step 4: Create Unified Hook Library
- Implement canonical hooks in shared location
- Add comprehensive type definitions
- Add tests for all hooks
- Document hook usage patterns
- Can run in parallel: No (blocks Step 5)

### Step 5: Replace Usages Incrementally
- Migrate one feature/module at a time
- Replace old hooks with canonical hooks
- Update imports and usage patterns
- Test thoroughly after each migration
- Can run in parallel: Yes (different features)

### Step 6: Delete Deprecated Hooks
- Remove duplicate hook implementations
- Remove unused hooks
- Archive deprecated hooks for reference
- Update documentation
- Can run in parallel: After Step 5 (gradual)

### Step 7: Enforce Naming via Lint Rule
- Create ESLint rule for hook naming
- Enforce `use` prefix requirement
- Enforce feature prefix for feature hooks
- Add to CI/CD pipeline
- Can run in parallel: After Step 4

### Step 8: Document Final Hook Map
- Create comprehensive hook documentation
- Document hook APIs and usage examples
- Create migration guide for future hooks
- Update developer guidelines
- Can run in parallel: After Step 6

**Execution Order:**
- Steps 1-2: Serial (audit â†’ classify)
- Steps 3-4: Serial (choose â†’ implement)
- Step 5: After Step 4 (migration)
- Steps 6-8: Can run in parallel after Step 5

---

## 8. Risk Map

### Breaking Behaviors in UI

**Risk:** Changing hook logic may break existing UI behaviors

**Mitigation:**
- Comprehensive testing before migration
- Visual regression testing
- Gradual migration with feature flags
- Maintain backward compatibility during transition
- Rollback plan for each migration step

### Circular Dependencies

**Risk:** Merging hooks may create circular dependencies

**Mitigation:**
- Dependency graph analysis before consolidation
- Clear module boundaries (shared vs feature)
- Feature hooks cannot import other feature hooks
- Use dependency injection where needed
- Lint rules to prevent circular imports

### Performance Regressions

**Risk:** Merged fetch hooks may cause performance issues

**Mitigation:**
- Performance testing before and after migration
- Maintain caching strategies
- Optimize hook implementations
- Monitor performance metrics
- Profile hook execution

### Accidental Re-renders

**Risk:** Hook consolidation may cause unnecessary re-renders

**Mitigation:**
- Use React.memo and useMemo appropriately
- Optimize hook dependencies
- Avoid creating new objects/functions in hooks
- Test re-render behavior
- Use React DevTools Profiler

### Lost Logic During Consolidation

**Risk:** Consolidating hooks may lose important edge case handling

**Mitigation:**
- Comprehensive audit of all hook behaviors
- Document all edge cases before consolidation
- Test all edge cases after consolidation
- Maintain test coverage
- Code review for logic preservation

### Type Safety Issues

**Risk:** Consolidating hooks may break TypeScript types

**Mitigation:**
- Comprehensive type definitions for all hooks
- Type tests for hook APIs
- Gradual typing migration
- Type checking in CI/CD
- Document type requirements

### Migration Complexity

**Risk:** Migrating hooks may be complex and error-prone

**Mitigation:**
- Gradual migration strategy
- Clear migration guide
- Automated codemods where possible
- Comprehensive testing at each step
- Rollback plan for each step

### Developer Confusion

**Risk:** New hook structure may confuse developers

**Mitigation:**
- Clear documentation and examples
- Migration guide with before/after examples
- Training sessions if needed
- Code review enforcement
- Lint rules to guide usage

---

## Summary

This plan establishes:
- Hook inventory organized by category
- Redundancy audit identifying 12 anti-patterns
- Unified hook set with clear boundaries
- Naming rules for consistency
- Consolidation rules for merging hooks
- Feature-level hook guidelines
- Migration strategy with parallelization opportunities
- Risk map with mitigation strategies

Ready for review before implementation begins.
