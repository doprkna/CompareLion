/**
 * Push Notifications (v0.21.0)
 * Client-side helpers for push notifications
 */
export interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}
/**
 * Check if push notifications are supported
 */
export declare function isPushSupported(): boolean;
/**
 * Get current notification permission
 */
export declare function getNotificationPermission(): NotificationPermission;
/**
 * Request notification permission
 */
export declare function requestNotificationPermission(): Promise<NotificationPermission>;
/**
 * Subscribe to push notifications
 */
export declare function subscribeToPush(): Promise<PushSubscriptionData | null>;
/**
 * Unsubscribe from push notifications
 */
export declare function unsubscribeFromPush(): Promise<boolean>;
/**
 * Check if user is subscribed
 */
export declare function isSubscribed(): Promise<boolean>;
/**
 * Show local notification (without push)
 */
export declare function showLocalNotification(title: string, options?: NotificationOptions): Promise<void>;
