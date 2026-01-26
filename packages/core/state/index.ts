/**
 * Unified State Management
 * Public export surface for state management module
 * v0.41.16 - C3 Step 17: Unified State Management Foundation
 * v0.41.17 - C3 Step 18: State Migration Batch #1
 */

// Types
export type {
  AsyncState,
  AsyncStateWithMeta,
  StoreState,
  CacheEntry,
  CacheConfig,
  StateEventType,
  StateEvent,
  StoreCreator,
  Selector,
  AsyncActionOptions,
} from './types';

// Store interfaces
export type {
  BaseStore,
  AsyncStore,
  ResourceStore,
  CollectionStore,
  StoreMetadata,
} from './store';

// Cache
export {
  CacheManager,
  defaultCache,
  invalidateByPattern,
  invalidateByTags,
  createCacheKey,
} from './cache';

// Factory functions
export {
  createAsyncStore,
  createResourceStore,
  createCollectionStore,
  createStore,
} from './factory';

// Selectors
export {
  selectAsyncState,
  selectData,
  selectLoading,
  selectError,
  selectIsLoaded,
  selectHasError,
  createSelector,
  combineSelectors,
  selectWithDefault,
} from './selectors';

// Stores (Batch #1 - Simple States)
export { useFlowRewardStore } from './stores/flowRewardStore';
export { useLifeRewardStore } from './stores/lifeRewardStore';
export { useSoundStore } from './stores/soundStore';

// Stores (Batch #2 - Moderate States)
export { useDiscoveriesStore } from './stores/discoveriesStore';
export { useRecipesStore } from './stores/recipesStore';
export { useLoreStore } from './stores/loreStore';
export { useRegionsStore } from './stores/regionsStore';
export { useRaritiesStore } from './stores/raritiesStore';

// Stores (Batch #3 - Complex Read States)
export { useBadgesStore, useUserBadgesStore } from './stores/badgesStore';
export { useSeasonStore } from './stores/seasonStore';
export { useRitualsStore } from './stores/ritualsStore';
export { useFiresidesStore, useFiresideStore } from './stores/firesidesStore';
export { useChronicleStore } from './stores/chronicleStore';
export { useLatestLoreStore } from './stores/latestLoreStore';

// Stores (Batch #4 - Mutation & Complex Domain States)
export { useFlowStore } from './stores/flowStore';
export { useStreakStore } from './stores/streakStore';
export { useFightStore } from './stores/fightStore';
export {
  useFriendsStore,
  useDuelsStore,
  useSocialFeedStore,
  useFriendRequestStore,
  useStartDuelStore,
} from './stores/socialStore';
export { useDailyForkStore, useChooseForkStore } from './stores/dailyForkStore';
export { useXpPopupStore } from './stores/xpPopupStore';
export { useSubmitMirrorReflectionStore } from './stores/mirrorReflectionStore';

