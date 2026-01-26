'use client';
// sanity-fix
'use client';
import { useCallback, useRef, useState } from 'react';
/**
 * Lightweight client-side counter to trigger reflection modal
 * after N comparisons. Debounced to avoid spam.
 */
export function useReflectionPrompt(min = 3, max = 5) {
    const [open, setOpen] = useState(false);
    const countRef = useRef(0);
    const lastOpenAtRef = useRef(0);
    const triggerIfNeeded = useCallback(() => {
        countRef.current += 1;
        const threshold = Math.min(Math.max(min, 1), max);
        if (countRef.current >= threshold) {
            // open once per minute max
            const now = Date.now();
            if (now - lastOpenAtRef.current > 60000) {
                setOpen(true);
                lastOpenAtRef.current = now;
            }
            countRef.current = 0;
        }
    }, [min, max]);
    const close = useCallback(() => setOpen(false), []);
    return { open, close, triggerIfNeeded };
}