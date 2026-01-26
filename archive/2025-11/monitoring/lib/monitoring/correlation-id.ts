/**
 * Correlation ID Middleware (v0.11.3)
 * 
 * Unique request tracking for distributed tracing.
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger";

export const CORRELATION_ID_HEADER = "x-correlation-id";

/**
 * Generate or extract correlation ID from request
 */
export function getCorrelationId(req: NextRequest): string {
  const existing = req.headers.get(CORRELATION_ID_HEADER);
  return existing || randomUUID();
}

/**
 * Add correlation ID to response headers
 */
export function addCorrelationId(
  response: NextResponse,
  correlationId: string
): NextResponse {
  response.headers.set(CORRELATION_ID_HEADER, correlationId);
  return response;
}

/**
 * Correlation ID context storage (AsyncLocalStorage)
 */
let correlationIdStorage: any = null;

if (typeof AsyncLocalStorage !== "undefined") {
  const { AsyncLocalStorage } = require("async_hooks");
  correlationIdStorage = new AsyncLocalStorage();
}

/**
 * Store correlation ID in async context
 */
export function setCorrelationIdContext(correlationId: string) {
  if (correlationIdStorage) {
    correlationIdStorage.enterWith({ correlationId });
  }
}

/**
 * Get correlation ID from context
 */
export function getCorrelationIdFromContext(): string | null {
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
  constructor(private context: string) {}

  private getPrefix(): string {
    const correlationId = getCorrelationIdFromContext();
    return correlationId
      ? `[${this.context}] [${correlationId.slice(0, 8)}]`
      : `[${this.context}]`;
  }

  log(message: string, ...args: any[]) {
    logger.info(`${this.getPrefix()} ${message}`, ...args);
  }

  error(message: string, error?: Error, ...args: any[]) {
    logger.error(`${this.getPrefix()} ${message}`, { error, ...args });
  }

  warn(message: string, ...args: any[]) {
    logger.warn(`${this.getPrefix()} ${message}`, ...args);
  }

  info(message: string, ...args: any[]) {
    logger.info(`${this.getPrefix()} ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    logger.debug(`${this.getPrefix()} ${message}`, ...args);
  }
}

/**
 * Create logger with context
 */
export function createLogger(context: string): CorrelatedLogger {
  return new CorrelatedLogger(context);
}













