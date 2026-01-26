'use client';
// sanity-fix
/**
 * useFiresides Hook
 * v0.41.19 - Migrated to unified state store (read-only parts)
 */
import { useEffect } from 'react';
import { useFiresidesStore, useFiresideStore } from '../state/stores/firesidesStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export function useFiresides() {
    const { state, load, reload } = useFiresidesStore();
    useEffect(() => {
        load();
    }, [load]);
    return {
        firesides: state.data?.firesides || [],
        loading: state.loading,
        error: state.error,
        reload,
    };
}
export function useFireside(id) {
    const { state, setKey, reload } = useFiresideStore();
    useEffect(() => {
        if (id) {
            setKey(id);
        }
        else {
            setKey(null);
        }
    }, [id, setKey]);
    return {
        fireside: state.data?.fireside || null,
        reactions: state.data?.reactions || [],
        loading: state.loading,
        error: state.error,
        reload: () => {
            if (id) {
                reload(id);
            }
        },
    };
}
export function useFiresideReactions(id) {
    const { fireside, reactions, reload } = useFireside(id);
    const [posting, setPosting] = useState(false);
    const post = useCallback(async (emoji) => {
        if (!id)
            return false;
        setPosting(true);
        try {
            const res = await fetch('/api/firesides/react', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firesideId: id, emoji }) });
            const json = await res.json();
            if (!res.ok || !json?.success)
                return false;
            await reload();
            return true;
        }
        finally {
            setPosting(false);
        }
    }, [id, reload]);
    return { fireside, reactions, post, posting, reload };
}
