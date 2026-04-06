/**
 * Push Notifications (v0.9.0)
 *
 * PLACEHOLDER: Web Push API integration.
 */
export interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: Record<string, any>;
    actions?: PushAction[];
}
export interface PushAction {
    action: string;
    title: string;
    icon?: string;
}
/**
 * PLACEHOLDER: Subscribe to push notifications
 */
export declare function subscribeToPush(userId: string): Promise<null>;
/**
 * PLACEHOLDER: Send push notification
 */
export declare function sendPushNotification(userId: string, payload: PushPayload): Promise<null>;
/**
 * Pre-defined notification templates
 */
export declare const PUSH_TEMPLATES: {
    duel_challenge: (challenger: string) => PushPayload;
    mini_event_started: (eventName: string) => PushPayload;
    message_received: (sender: string, preview: string) => PushPayload;
    clan_activity: (clanName: string, activity: string) => PushPayload;
    achievement_unlocked: (achievementName: string) => PushPayload;
};
