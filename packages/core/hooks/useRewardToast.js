'use client';
// sanity-fix
/**
 * useRewardToast Hook
 *
 * v0.26.9 - Unified toast system for all event types
 *
 * Manages toast notifications for combat, rewards, achievements, crafting, shop, rest, etc.
 * Provides a queue system with auto-dismiss and smart stacking.
 *
 * Usage:
 * ```tsx
 * const { pushToast } = useRewardToast();
 *
 * pushToast({ type: 'xp', amount: 50, message: 'Gained XP!' });
 * pushToast({ type: 'gold', amount: 25 });
 * pushToast({ type: 'crit', message: 'Critical hit!' });
 * pushToast({ type: 'craft', message: 'Forged Epic Sword' });
 * pushToast({ type: 'error', message: 'Not enough gold', persist: true });
 * ```
 */
'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { TOAST_THEME } from './toastTheme'; // sanity-fix
import { getUiConfig } from '../config/unified'; // sanity-fix: replaced @parel/core/config self-import with relative import
export function useRewardToast() {
    const [toasts, setToasts] = useState([]);
    const timeoutRefs = useRef(new Map());
    const idCounter = useRef(0);
    // Get UI config values
    const uiConfig = getUiConfig();
    const MAX_TOASTS = uiConfig.toast.maxToasts;
    const DEFAULT_DURATION = uiConfig.toast.defaultDuration;
    // Auto-dismiss toast after duration (unless persist=true)
    const scheduleDismiss = useCallback((id, persist = false, toastType) => {
        if (persist) {
            // Don't schedule dismiss for persistent toasts
            return;
        }
        // Clear any existing timeout
        if (timeoutRefs.current && typeof timeoutRefs.current.get === 'function') { // sanity-fix
            const existing = timeoutRefs.current.get(id);
            if (existing) {
                clearTimeout(existing);
            }
        }
        // Get duration from theme, or use default
        const theme = toastType ? TOAST_THEME[toastType] : null;
        const duration = theme?.duration || DEFAULT_DURATION;
        const timeout = setTimeout(() => {
            setToasts((prev) => Array.isArray(prev) ? prev.filter((t) => t.id !== id) : []); // sanity-fix
            if (timeoutRefs.current && typeof timeoutRefs.current.delete === 'function') { // sanity-fix
                timeoutRefs.current.delete(id);
            }
        }, duration);
        if (timeoutRefs.current && typeof timeoutRefs.current.set === 'function') { // sanity-fix
            timeoutRefs.current.set(id, timeout);
        }
    }, []);
    // Create message based on type (v0.26.9 - expanded)
    const createMessage = useCallback((params) => {
        // Custom message always takes precedence
        if (params.message) {
            return params.message;
        }
        // Type-specific messages
        const theme = TOAST_THEME[params.type];
        const icon = params.icon || theme.icon;
        switch (params.type) {
            case 'boss':
                if (params.xp !== undefined && params.gold !== undefined) {
                    return `${icon} Boss defeated! +${params.xp} XP, +${params.gold} gold`;
                }
                return `${icon} Boss defeated!`;
            case 'xp':
                return `${icon} +${params.amount || 0} XP`;
            case 'gold':
                return `${icon} +${params.amount || 0} gold`;
            case 'item':
                return `${icon} Item found!`;
            case 'crit':
                return `${icon} Critical hit!`;
            case 'craft':
                return `${icon} Crafted successfully!`;
            case 'shop':
                return `${icon} Purchase complete!`;
            case 'achievement':
                return `${icon} Achievement unlocked!`;
            case 'rest':
                return `${icon} Restored!`;
            case 'info':
                return `${icon} ${params.message || 'Information'}`;
            case 'error':
                return `${icon} ${params.message || 'Error occurred'}`;
            default:
                return `${icon} ${params.type} event`;
        }
    }, []);
    const pushToast = useCallback((params) => {
        const id = `toast-${Date.now()}-${idCounter.current++}`;
        const message = createMessage(params);
        const theme = TOAST_THEME[params.type];
        const newToast = {
            id,
            type: params.type,
            amount: params.amount,
            xp: params.xp,
            gold: params.gold,
            message,
            timestamp: Date.now(),
            persist: params.persist,
            icon: params.icon || theme.icon,
        };
        setToasts((prev) => {
            if (!Array.isArray(prev))
                return [newToast]; // sanity-fix
            // Remove oldest if at max (unless it's persistent)
            const updated = [...prev, newToast];
            const maxToasts = getUiConfig().toast.maxToasts;
            if (updated.length > maxToasts) {
                // Remove oldest non-persistent toast first
                const indexToRemove = updated.findIndex((t) => !t.persist);
                if (indexToRemove === -1) {
                    // All persistent, remove oldest anyway
                    const removed = updated.shift();
                    if (removed && timeoutRefs.current && typeof timeoutRefs.current.get === 'function') { // sanity-fix
                        const timeout = timeoutRefs.current.get(removed.id);
                        if (timeout) {
                            clearTimeout(timeout);
                            if (typeof timeoutRefs.current.delete === 'function') { // sanity-fix
                                timeoutRefs.current.delete(removed.id);
                            }
                        }
                    }
                }
                else {
                    const spliceResult = updated.splice(indexToRemove, 1);
                    const removed = Array.isArray(spliceResult) && spliceResult.length > 0 ? spliceResult[0] : null; // sanity-fix
                    if (removed && timeoutRefs.current && typeof timeoutRefs.current.get === 'function') { // sanity-fix
                        const timeout = timeoutRefs.current.get(removed.id);
                        if (timeout) {
                            clearTimeout(timeout);
                            if (typeof timeoutRefs.current.delete === 'function') { // sanity-fix
                                timeoutRefs.current.delete(removed.id);
                            }
                        }
                    }
                }
            }
            return updated;
        });
        scheduleDismiss(id, params.persist || false, params.type);
    }, [createMessage, scheduleDismiss]);
    // Cleanup on unmount and route change (v0.26.9)
    useEffect(() => {
        return () => {
            if (timeoutRefs.current && typeof timeoutRefs.current.forEach === 'function') { // sanity-fix
                timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
            }
            if (timeoutRefs.current && typeof timeoutRefs.current.clear === 'function') { // sanity-fix
                timeoutRefs.current.clear();
            }
        };
    }, []);
    // v0.26.9 - Clear all toasts on route change (except persistent)
    useEffect(() => {
        const handleRouteChange = () => {
            setToasts((prev) => {
                if (!Array.isArray(prev))
                    return []; // sanity-fix
                const persistent = prev.filter((t) => t.persist);
                // Clear timeouts for non-persistent toasts
                prev.forEach((t) => {
                    if (!t.persist && timeoutRefs.current && typeof timeoutRefs.current.get === 'function') { // sanity-fix
                        const timeout = timeoutRefs.current.get(t.id);
                        if (timeout) {
                            clearTimeout(timeout);
                            if (typeof timeoutRefs.current.delete === 'function') { // sanity-fix
                                timeoutRefs.current.delete(t.id);
                            }
                        }
                    }
                });
                return persistent;
            });
        };
        // Listen for route changes (Next.js router events)
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', handleRouteChange);
            return () => {
                window.removeEventListener('beforeunload', handleRouteChange);
            };
        }
    }, []);
    const dismissToast = useCallback((id) => {
        if (timeoutRefs.current && typeof timeoutRefs.current.get === 'function') { // sanity-fix
            const timeout = timeoutRefs.current.get(id);
            if (timeout) {
                clearTimeout(timeout);
                if (typeof timeoutRefs.current.delete === 'function') { // sanity-fix
                    timeoutRefs.current.delete(id);
                }
            }
        }
        setToasts((prev) => Array.isArray(prev) ? prev.filter((t) => t.id !== id) : []); // sanity-fix
    }, []);
    return {
        toasts,
        pushToast,
        dismissToast,
    };
}
