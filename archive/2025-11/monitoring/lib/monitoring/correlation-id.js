/**
 * Correlation ID Middleware (v0.11.3)
 *
 * Unique request tracking for distributed tracing.
 */
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger";
export const CORRELATION_ID_HEADER = "x-correlation-id";
/**
 * Generate or extract correlation ID from request
 */
export function getCorrelationId(req) {
    const existing = req.headers.get(CORRELATION_ID_HEADER);
    return existing || randomUUID();
}
/**
 * Add correlation ID to response headers
 */
export function addCorrelationId(response, correlationId) {
    response.headers.set(CORRELATION_ID_HEADER, correlationId);
    return response;
}
/**
 * Correlation ID context storage (AsyncLocalStorage)
 */
let correlationIdStorage = null;
if (typeof AsyncLocalStorage !== "undefined") {
    const { AsyncLocalStorage } = require("async_hooks");
    correlationIdStorage = new AsyncLocalStorage();
}
/**
 * Store correlation ID in async context
 */
export function setCorrelationIdContext(correlationId) {
    if (correlationIdStorage) {
        correlationIdStorage.enterWith({ correlationId });
    }
}
/**
 * Get correlation ID from context
 */
export function getCorrelationIdFromContext() {
    if (correlationIdStorage) {
        const store = correlationIdStorage.getStore();
        return store?.correlationId || null;
    }
    return null;
}
/**
 * Enhanced logger with correlation ID
 */
export class CorrelatedLogger {
    constructor(context) {
        this.context = context;
    }
    getPrefix() {
        const correlationId = getCorrelationIdFromContext();
        return correlationId
            ? `[${this.context}] [${correlationId.slice(0, 8)}]`
            : `[${this.context}]`;
    }
    log(message, ...args) {
        logger.info(`${this.getPrefix()} ${message}`, ...args);
    }
    error(message, error, ...args) {
        logger.error(`${this.getPrefix()} ${message}`, { error, ...args });
    }
    warn(message, ...args) {
        logger.warn(`${this.getPrefix()} ${message}`, ...args);
    }
    info(message, ...args) {
        logger.info(`${this.getPrefix()} ${message}`, ...args);
    }
    debug(message, ...args) {
        logger.debug(`${this.getPrefix()} ${message}`, ...args);
    }
}
/**
 * Create logger with context
 */
export function createLogger(context) {
    return new CorrelatedLogger(context);
}
