'use client';
// sanity-fix
'use client';
import { useEffect, useRef } from 'react';
/**
 * Performance measurement hook for React components
 * Logs mount and render times to console
 * v0.32.1 - Performance & Caching Audit
 */
export function usePerfMeter(label) {
    const mountTimeRef = useRef(null);
    const renderStartRef = useRef(null);
    // Measure mount time
    useEffect(() => {
        // Only log in development
        if (process.env.NODE_ENV === 'production' || typeof performance === 'undefined') { // sanity-fix
            return;
        }
        const mountTime = performance.now();
        mountTimeRef.current = mountTime;
        // Measure initial render time
        const renderTime = performance.now() - mountTime;
        console.log(`[PERF] Widget ${label} mounted in ${renderTime.toFixed(2)}ms`);
        return () => {
            if (mountTimeRef.current) {
                const unmountTime = performance.now() - mountTimeRef.current;
                console.log(`[PERF] Widget ${label} unmounted after ${unmountTime.toFixed(2)}ms`);
            }
        };
    }, [label]);
    // Measure render time
    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || typeof performance === 'undefined') { // sanity-fix
            return;
        }
        const renderStart = performance.now();
        renderStartRef.current = renderStart;
        return () => {
            if (renderStartRef.current) {
                const renderTime = performance.now() - renderStartRef.current;
                console.log(`[PERF] Widget ${label} rendered in ${renderTime.toFixed(2)}ms`);
            }
        };
    });
    // Measure render time (alternative approach)
    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || typeof performance === 'undefined' || typeof requestAnimationFrame === 'undefined') { // sanity-fix
            return;
        }
        const start = performance.now();
        // Use requestAnimationFrame to measure paint time
        requestAnimationFrame(() => {
            const paintTime = performance.now() - start;
            if (paintTime > 16) { // Only log if render takes > 16ms (one frame)
                console.log(`[PERF] Widget ${label} painted in ${paintTime.toFixed(2)}ms`);
            }
        });
    });
}