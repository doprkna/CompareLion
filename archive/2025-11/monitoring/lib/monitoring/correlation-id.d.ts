/**
 * Correlation ID Middleware (v0.11.3)
 *
 * Unique request tracking for distributed tracing.
 */
import { NextRequest, NextResponse } from "next/server";
export declare const CORRELATION_ID_HEADER = "x-correlation-id";
/**
 * Generate or extract correlation ID from request
 */
export declare function getCorrelationId(req: NextRequest): string;
/**
 * Add correlation ID to response headers
 */
export declare function addCorrelationId(response: NextResponse, correlationId: string): NextResponse;
/**
 * Store correlation ID in async context
 */
export declare function setCorrelationIdContext(correlationId: string): void;
/**
 * Get correlation ID from context
 */
export declare function getCorrelationIdFromContext(): string | null;
/**
 * Enhanced logger with correlation ID
 */
export declare class CorrelatedLogger {
    private context;
    constructor(context: string);
    private getPrefix;
    log(message: string, ...args: any[]): void;
    error(message: string, error?: Error, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
}
/**
 * Create logger with context
 */
export declare function createLogger(context: string): CorrelatedLogger;
