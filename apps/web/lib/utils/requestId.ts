import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Extract request ID from headers or generate a new one
 */
export function getRequestId(req: NextRequest): string {
  return req.headers.get('x-request-id') || generateRequestId();
}

/**
 * Add request ID to response headers
 */
export function addRequestIdToResponse(response: NextResponse, requestId: string): NextResponse {
  response.headers.set('x-request-id', requestId);
  return response;
}

/**
 * Create a response with request ID
 */
export function createResponseWithRequestId(
  data: any, 
  status: number = 200, 
  requestId: string
): NextResponse {
  const response = NextResponse.json(data, { status });
  return addRequestIdToResponse(response, requestId);
}
