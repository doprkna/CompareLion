'use client';
// sanity-fix
'use client';
import { useEffect } from 'react';
import { useRegionsStore } from '../state/stores/regionsStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
/**
 * useRegions Hook
 * v0.41.18 - Migrated to unified state store
 */
export function useRegions() {
    const { state, load, reload } = useRegionsStore();
    useEffect(() => {
        load();
    }, [load]);
    return {
        regions: state.data?.regions || [],
        loading: state.loading,
        error: state.error,
        activeRegionId: state.data?.activeRegionId || null,
        reload,
    };
}
export function useTravel() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const travel = async (targetRegionId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/regions/travel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetRegionId }),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to travel');
            }
            return data;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to travel';
            setError(message);
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    return { travel, loading, error };
}
export function useActiveRegion() {
    const [region, setRegion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchActiveRegion = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/regions/current');
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch active region');
            }
            setRegion(data.region);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load active region');
            setRegion(null);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchActiveRegion();
    }, []);
    return { region, loading, error, reload: fetchActiveRegion };
}
export function useUnlockRegion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const unlock = async (regionId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/regions/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ regionId }),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to unlock region');
            }
            return data;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to unlock region';
            setError(message);
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    return { unlock, loading, error };
}
