/**
 * useSubmitMirrorReflection Hook
 * v0.41.20 - Migrated to unified state store
 */
import { useSubmitMirrorReflectionStore } from '@parel/core/state/stores/mirrorReflectionStore';
export function useSubmitMirrorReflection() {
    const { submit, loading, error } = useSubmitMirrorReflectionStore();
    return { submit, loading, error };
}
