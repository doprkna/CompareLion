/**
 * useRealtime Hook
 *
 * Establishes a persistent Server-Sent Events (SSE) connection
 * for real-time updates from the server.
 *
 * Usage:
 * ```tsx
 * function App() {
 *   useRealtime(); // Establishes global connection
 *   return <YourApp />;
 * }
 * ```
 */
export declare function useRealtime(): void;
/**
 * Hook to check if real-time connection is active
 * @returns boolean indicating connection status
 */
export declare function useRealtimeStatus(): boolean;
