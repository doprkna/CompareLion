export declare function logEvent(event: string, data?: any): void;
/** Telemetry event names (for type-safe usage). */
export declare const TelemetryEvents: {
    readonly PURCHASE_STARTED: "purchase_started";
    readonly PURCHASE_COMPLETED: "purchase_completed";
    readonly PURCHASE_FAILED: "purchase_failed";
};
export type TelemetryEvents = (typeof TelemetryEvents)[keyof typeof TelemetryEvents];
