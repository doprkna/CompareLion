/**
 * Alert Notification System
 * Sends alerts via webhooks (Discord, Slack, generic) and email
 * v0.33.1 - Alert Notifications & Webhooks
 */
/**
 * Send alert notification to all active webhooks
 * Retries up to 3 times on failure
 */
export declare function sendAlert(alert: {
    type: string;
    level: string;
    message: string;
    metadata?: any;
}): Promise<void>;
/**
 * Send email alert (optional, requires email service)
 */
export declare function sendEmailAlert(alert: {
    type: string;
    level: string;
    message: string;
    metadata?: any;
}): Promise<void>;
/**
 * Send test alert to verify webhook configuration
 */
export declare function sendTestAlert(webhookUrl: string, webhookType: string): Promise<boolean>;
