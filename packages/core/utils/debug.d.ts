/**
 * Debug Utility
 * Centralized logging with environment-based control
 * v0.13.2p - Enhanced with PII sanitization and build tagging
 * v0.30.4 - Infrastructure Refactor - Consolidated all debug utilities
 */
export interface DebugContext {
    [key: string]: any;
}
/**
 * Debug log (only in development or when DEBUG=1)
 */
export declare function debug(message: string, context?: DebugContext): void;
/**
 * Info log (visible in all environments)
 */
export declare function info(message: string, context?: DebugContext): void;
/**
 * Warning log
 */
export declare function warn(message: string, context?: DebugContext): void;
/**
 * Error log (with PII sanitization)
 */
export declare function error(message: string, err?: Error | unknown, context?: DebugContext): void;
/**
 * Performance timing utility
 */
export declare function perfStart(label: string): () => void;
/**
 * Conditional debug based on flag
 */
export declare function debugIf(condition: boolean, message: string, context?: DebugContext): void;
/**
 * Test-only logging
 */
export declare function testLog(message: string, context?: DebugContext): void;
/**
 * API request/response logger
 */
export declare function logApi(method: string, path: string, status: number, duration?: number): void;
/**
 * Database query logger
 */
export declare function logQuery(operation: string, table: string, duration?: number): void;
export declare const logger: {
    debug: typeof debug;
    info: typeof info;
    warn: typeof warn;
    error: typeof error;
    perfStart: typeof perfStart;
    debugIf: typeof debugIf;
    testLog: typeof testLog;
    logApi: typeof logApi;
    logQuery: typeof logQuery;
};
