/**
 * Centralized API Error Handler
 * 
 * Provides consistent error responses across all API routes.
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export function handleApiError(
  error: any,
  context: string = "API operation"
): NextResponse {
  logger.error(`[API Error] ${context}`, error);

  // Prisma errors
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          { error: "A record with this information already exists" },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        );
      case 'P2003':
        return NextResponse.json(
          { error: "Related record not found" },
          { status: 400 }
        );
      default:
        return NextResponse.json(
          { error: "Database operation failed", code: error.code },
          { status: 500 }
        );
    }
  }

  // Generic errors
  const message = error.message || "An unexpected error occurred";
  const statusCode = error.statusCode || 500;

  return NextResponse.json(
    { error: message },
    { status: statusCode }
  );
}
















