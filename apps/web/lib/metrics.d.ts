export declare function trackEvent(name: string, payload?: Record<string, unknown>): void;
/** Flow event logging (no-op). */
export declare function logFlowEvent(_event: string, _userId: string, _payload?: Record<string, unknown>): Promise<void>;
