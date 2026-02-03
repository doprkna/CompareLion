/**
 * Webhook Notification System
 *
 * Sends notifications when database reseed is triggered
 * Supports Discord webhooks and generic HTTP endpoints
 */
declare class WebhookNotifier {
    private config;
    constructor();
    notifyReseed(recordCount: number, timestamp: string): Promise<void>;
    private sendDiscordNotification;
    private sendGenericWebhook;
}
export { WebhookNotifier };
