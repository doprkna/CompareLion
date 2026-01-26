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
/**
 * Subscribe to an event from the event bus
 * @param event Event name to listen to
 * @param handler Callback function to execute when event is emitted
 */
export declare function useEventBus(event: string, handler: (payload: any) => void): void;
/**
 * Subscribe to an event that only fires once
 * @param event Event name to listen to
 * @param handler Callback function to execute when event is emitted
 */
export declare function useEventBusOnce(event: string, handler: (payload: any) => void): void;
/**
 * Subscribe to multiple events at once
 * @param events Object mapping event names to handlers
 */
export declare function useEventBusMultiple(events: Record<string, (payload: any) => void>): void;
