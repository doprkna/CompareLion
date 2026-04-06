/**
 * Centralized API Error Handler
 *
 * Provides consistent error responses across all API routes.
 */
import { NextResponse } from "next/server";
export declare function handleApiError(error: any, context?: string): NextResponse;
