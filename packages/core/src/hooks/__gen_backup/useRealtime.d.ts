export declare function useRealtime(): {
    subscribe: <T = unknown>(ev: string, handler: (payload?: T) => void) => void;
    unsubscribe: <T = unknown>(ev: string, handler: (payload?: T) => void) => void;
};
/**
 * Hook to check if real-time connection is active
 * @returns boolean indicating connection status
 */
export declare function useRealtimeStatus(): boolean;
