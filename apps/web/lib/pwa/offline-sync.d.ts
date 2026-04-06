/**
 * Offline Sync (v0.9.0)
 *
 * PLACEHOLDER: Background sync for offline actions.
 */
export interface OfflineActionPayload {
    actionType: "answer" | "message" | "challenge_response" | "purchase";
    data: Record<string, any>;
}
/**
 * PLACEHOLDER: Queue offline action
 */
export declare function queueOfflineAction(userId: string, action: OfflineActionPayload): Promise<null>;
/**
 * PLACEHOLDER: Process pending offline actions
 */
export declare function processPendingActions(userId: string): Promise<never[]>;
/**
 * PLACEHOLDER: Register background sync
 */
export declare function registerBackgroundSync(): Promise<void>;
