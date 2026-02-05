/**
 * Notification Toast Hook
 * Shows toasts for new notifications
 * v0.36.26 - Notifications 2.0
 * v0.41.13 - Migrated to unified API client
 */
/**
 * Show a notification toast
 */
export declare function showNotificationToast(type: string, title: string, body?: string | null): void;
/**
 * Hook to poll for new notifications and show toasts
 * Call this in a component that should show notification toasts
 */
export declare function useNotificationToasts(enabled?: boolean): void;
