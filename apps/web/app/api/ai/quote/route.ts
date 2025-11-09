/**
 * Quote of the Day API
 * v0.19.0 - Serve daily inspiration
 * v0.22.3 - Performance optimization: Load quotes once at module level
 * v0.22.5 - Centralized cache for consistency
 */

import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { cache } from '@/lib/cache';
import fs from 'fs';
import path from 'path';

interface Quote {
  id: number;
  text: string;
  author: string;
  category: string;
}

// Load quotes once at module initialization (outside hot path)
const quotesPath = path.join(process.cwd(), 'data', 'quotes.json');
const quotesData = fs.readFileSync(quotesPath, 'utf-8');
let quotes: Quote[] = []; // sanity-fix
try { // sanity-fix
  const parsed = JSON.parse(quotesData); // sanity-fix
  quotes = parsed.quotes || []; // sanity-fix
} catch { // sanity-fix
  quotes = []; // sanity-fix
} // sanity-fix

/**
 * GET /api/ai/quote
 * Get quote of the day (cached until midnight)
 */
export const GET = safeAsync(async (_req: NextRequest) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const cacheKey = `quote:daily:${today}`;

  // Check cache first
  const cached = cache.get<Quote>(cacheKey);
  if (cached) {
    return successResponse({
      quote: cached,
      cached: true,
    });
  }

  // Select quote based on today's date (deterministic)
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const quoteIndex = dayOfYear % quotes.length;
  const selectedQuote: Quote = quotes[quoteIndex];

  // Calculate TTL: seconds until midnight
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(23, 59, 59, 999);
  const ttlSeconds = Math.floor((midnight.getTime() - now.getTime()) / 1000);

  // Cache the quote until midnight
  cache.set(cacheKey, selectedQuote, ttlSeconds);

  return successResponse({
    quote: selectedQuote,
    cached: false,
    expiresAt: midnight.toISOString(),
  });
});

