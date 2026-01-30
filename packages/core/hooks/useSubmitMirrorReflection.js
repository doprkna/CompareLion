/**
 * useSubmitMirrorReflection Hook
 * v0.41.20 - Migrated to unified state store
 */
import { useSubmitMirrorReflectionStore } from '../state/stores/mirrorReflectionStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export function useSubmitMirrorReflection() {
    const { submit, loading, error } = useSubmitMirrorReflectionStore();
    return { submit, loading, error };
}
