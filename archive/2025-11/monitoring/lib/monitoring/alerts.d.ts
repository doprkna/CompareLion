/**
 * Alert System (v0.11.3)
 *
 * Send critical alerts to Slack/Discord webhooks.
 */
export declare enum AlertSeverity {
    INFO = "info",
    WARNING = "warning",
    CRITICAL = "critical"
}
export interface AlertOptions {
    title: string;
    message: string;
    severity: AlertSeverity;
    metadata?: Record<string, any>;
    userId?: string;
    endpoint?: string;
}
/**
 * Send alert to all configured channels
 */
export declare function sendAlert(options: AlertOptions): Promise<void>;
/**
 * Convenience functions
 */
export declare const alertInfo: (title: string, message: string, metadata?: Record<string, any>) => Promise<void>;
export declare const alertWarning: (title: string, message: string, metadata?: Record<string, any>) => Promise<void>;
export declare const alertCritical: (title: string, message: string, metadata?: Record<string, any>) => Promise<void>;
