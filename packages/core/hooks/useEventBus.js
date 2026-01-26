'use client';
// sanity-fix
/**
 * useEventBus Hook
 *
 * React hook for subscribing to event bus events.
 * Automatically handles cleanup on unmount.
 *
 * Usage:
 * ```tsx
 * useEventBus('message:new', (data) => {
 *   console.log('New message:', data);
 *   refreshMessages();
 * });
 * ```
 */
'use client';
import { useEffect, useCallback } from "react";
import { eventBus } from "./eventBus"; // sanity-fix
/**
 * Subscribe to an event from the event bus
 * @param event Event name to listen to
 * @param handler Callback function to execute when event is emitted
 */
export function useEventBus(event, handler) {
    // Wrap handler in useCallback to prevent unnecessary re-subscriptions
    const stableHandler = useCallback(handler, [handler]);
    useEffect(() => {
        // Subscribe to event
        eventBus.on(event, stableHandler);
        // Cleanup: unsubscribe on unmount or when dependencies change
        return () => {
            eventBus.off(event, stableHandler);
        };
    }, [event, stableHandler]);
}
/**
 * Subscribe to an event that only fires once
 * @param event Event name to listen to
 * @param handler Callback function to execute when event is emitted
 */
export function useEventBusOnce(event, handler) {
    const stableHandler = useCallback(handler, [handler]);
    useEffect(() => {
        eventBus.once(event, stableHandler);
        // Note: once() auto-unsubscribes, but we clean up just in case
        return () => {
            eventBus.off(event, stableHandler);
        };
    }, [event, stableHandler]);
}
/**
 * Subscribe to multiple events at once
 * @param events Object mapping event names to handlers
 */
export function useEventBusMultiple(events) {
    useEffect(() => {
        if (!events || typeof events !== 'object')
            return; // sanity-fix
        // Subscribe to all events
        Object.entries(events).forEach(([event, handler]) => {
            eventBus.on(event, handler);
        });
        // Cleanup: unsubscribe from all events
        return () => {
            if (!events || typeof events !== 'object')
                return; // sanity-fix
            Object.entries(events).forEach(([event, handler]) => {
                eventBus.off(event, handler);
            });
        };
    }, [events]);
}