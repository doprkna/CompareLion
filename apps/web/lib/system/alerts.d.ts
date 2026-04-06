export declare const placeholder = true;
/**
 * Resolve all alerts (stub for build safety)
 */
export declare function resolveAllAlerts(): Promise<{
    success: boolean;
    count: number;
}>;
/**
 * Resolve single alert (stub for build safety)
 */
export declare function resolveAlert(alertId: string): Promise<{
    success: boolean;
    alertId: string;
}>;
