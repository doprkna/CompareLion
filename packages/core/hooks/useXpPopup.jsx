'use client';
// sanity-fix
/**
 * useXpPopup Hook
 * v0.41.20 - Migrated to unified state store
 */
'use client';
import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useXpPopupStore } from '@parel/core/state/stores/xpPopupStore';
import { XpPopup } from './XpPopup'; // sanity-fix
export function useXpPopup() {
    const { instances, triggerXp, removeInstance } = useXpPopupStore();
    // Render portal with all active popups
    const XpPopupPortal = useCallback(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined')
            return null; // sanity-fix
        return createPortal(<>
        {Array.isArray(instances) ? instances.map((instance) => ( // sanity-fix
            <XpPopup key={instance.id} amount={instance.amount} offsetX={instance.offsetX} offsetY={instance.offsetY} variant={instance.variant} onComplete={() => removeInstance(instance.id)}/>)) : null}
      </>, document.body);
    }, [instances, removeInstance]);
    return {
        triggerXp,
        XpPopupPortal,
    };
}