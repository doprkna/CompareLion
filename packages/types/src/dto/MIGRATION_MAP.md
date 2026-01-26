# DTO Migration Map

**Version:** v0.41.7  
**Status:** Foundation Phase (No Endpoint Migration Yet)

## Overview

This document tracks the migration of scattered DTOs and inline types to the unified DTO structure defined in `packages/types/src/dto/`.

## Scattered DTOs to Migrate

### 1. Challenge/Quest DTOs

**Current Locations:**
- `packages/core/hooks/useQuests.ts` → `Quest` interface
- `packages/core/hooks/useChallenges.ts` → Inline challenge types
- `apps/web/app/api/challenges/route.ts` → Inline challenge objects
- `apps/web/app/api/quests/route.ts` → Inline quest objects

**Target DTO:**
- `ChallengeDTO` (base) from `packages/types/src/dto/challenge/`
- Future: `QuestDTO` (extends `ChallengeDTO`)

**Migration Priority:** High  
**Estimated Endpoints:** `/api/challenges`, `/api/quests`

---

### 2. User DTOs

**Current Locations:**
- `packages/types/src/user.ts` → `UserProfile` interface (already exists)
- `packages/core/hooks/useProfile.ts` → Inline user types
- `apps/web/app/api/profile/route.ts` → Inline user objects
- `apps/web/app/api/feed/route.ts` → Inline user objects in feed posts

**Target DTO:**
- `UserDTO` (base) from `packages/types/src/dto/user/`
- Note: `UserProfile` from `packages/types/src/user.ts` may be extended/consolidated

**Migration Priority:** High  
**Estimated Endpoints:** `/api/profile`, `/api/feed`, `/api/social/*`

---

### 3. Event DTOs

**Current Locations:**
- `apps/web/app/api/events/route.ts` → Inline event objects
- `apps/web/app/api/mirror-events/active/route.ts` → Inline mirror event objects

**Target DTO:**
- `EventDTO` (base) from `packages/types/src/dto/event/`
- Future: `MirrorEventDTO` (extends `EventDTO`)

**Migration Priority:** Medium  
**Estimated Endpoints:** `/api/events`, `/api/mirror-events/*`

---

### 4. Story DTOs

**Current Locations:**
- `packages/core/hooks/useChronicle.ts` → `Chronicle` interface
- `packages/story/src/storyChallengeService.ts` → `StoryChallenge` interface
- `packages/story/src/weeklyStoryService.ts` → `WeeklyStoryPanel` interface
- Future story endpoints → Inline story objects

**Target DTO:**
- `StoryDTO` (base) from `packages/types/src/dto/story/`
- Future: `ChronicleDTO`, `StoryChallengeDTO` (extend `StoryDTO`)

**Migration Priority:** Medium  
**Estimated Endpoints:** Future story endpoints

---

### 5. Social/Feed DTOs

**Current Locations:**
- `packages/core/hooks/useSocial.ts` → `Friend`, `Duel`, `FeedItem` interfaces
- `packages/core/hooks/useFeed.ts` → Inline feed types
- `apps/web/app/api/feed/route.ts` → Inline feed post objects

**Target DTO:**
- Future: `FriendDTO`, `DuelDTO`, `FeedPostDTO` (to be created)

**Migration Priority:** Low  
**Estimated Endpoints:** `/api/feed`, `/api/social/*`

---

### 6. Lore/Discovery DTOs

**Current Locations:**
- `packages/core/hooks/useLore.ts` → `LoreEntry` interface
- `packages/core/hooks/useDiscoveryIndex.ts` → `Discovery` interface

**Target DTO:**
- Future: `LoreDTO`, `DiscoveryDTO` (to be created)

**Migration Priority:** Low  
**Estimated Endpoints:** `/api/lore/*`, `/api/discover/*`

---

## Migration Phases

### Phase 1: Foundation (v0.41.7) ✅
- [x] Create base DTO structure
- [x] Define `ApiEnvelopeDTO`, `PaginationDTO`
- [x] Define minimal `ChallengeDTO`, `UserDTO`, `EventDTO`, `StoryDTO`
- [x] Create migration map document
- [x] **No endpoint migration yet**

### Phase 2: Challenge DTOs Migration (Future)
- [ ] Migrate `/api/challenges` to use `ChallengeDTO[]`
- [ ] Migrate `/api/quests` to use `QuestDTO[]` (extends `ChallengeDTO`)
- [ ] Update hooks to use DTOs
- [ ] Remove inline challenge types

### Phase 3: User DTOs Migration (Future)
- [ ] Migrate `/api/profile` to use `UserDTO`
- [ ] Consolidate `UserProfile` and `UserDTO`
- [ ] Update hooks to use DTOs
- [ ] Remove inline user types

### Phase 4: Event DTOs Migration (Future)
- [ ] Migrate `/api/events` to use `EventDTO[]`
- [ ] Migrate `/api/mirror-events/*` to use `MirrorEventDTO[]`
- [ ] Update hooks to use DTOs
- [ ] Remove inline event types

### Phase 5: Story DTOs Migration (Future)
- [ ] Migrate story endpoints to use `StoryDTO`
- [ ] Create `ChronicleDTO`, `StoryChallengeDTO` extensions
- [ ] Update hooks to use DTOs
- [ ] Remove inline story types

### Phase 6: Social/Feed DTOs Migration (Future)
- [ ] Create `FriendDTO`, `DuelDTO`, `FeedPostDTO`
- [ ] Migrate `/api/feed` to use `FeedPostDTO[]`
- [ ] Migrate `/api/social/*` to use social DTOs
- [ ] Update hooks to use DTOs

### Phase 7: Lore/Discovery DTOs Migration (Future)
- [ ] Create `LoreDTO`, `DiscoveryDTO`
- [ ] Migrate `/api/lore/*` to use `LoreDTO`
- [ ] Migrate `/api/discover/*` to use `DiscoveryDTO`
- [ ] Update hooks to use DTOs

---

## Migration Guidelines

### When Migrating Endpoints

1. **Import DTOs:** Import from `@parel/types/dto`
2. **Type Responses:** Use `ApiEnvelopeDTO<YourDTO>` for response types
3. **Update Hooks:** Update frontend hooks to use DTOs
4. **Remove Inline Types:** Remove inline type definitions from endpoints
5. **Test Thoroughly:** Ensure type safety and runtime behavior

### DTO Extension Pattern

```typescript
// Base DTO
export interface ChallengeDTO { ... }

// Extended DTO
export interface QuestDTO extends ChallengeDTO {
  // Quest-specific fields
  userQuestId?: string;
  progressPercent: number;
  isClaimed: boolean;
}
```

### Backward Compatibility

- DTOs are additive only
- Existing code continues to work
- Migration is gradual, endpoint by endpoint
- No breaking changes during migration

---

## Notes

- **Current Status:** Foundation complete, ready for endpoint migration
- **Next Step:** Begin Phase 2 (Challenge DTOs Migration) when ready
- **Risk Level:** Low (additive changes only)

