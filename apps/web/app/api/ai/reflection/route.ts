/**
 * AI Reflection API
 * v0.19.0 - Generate personalized reflections
 * v0.22.5 - Add caching to prevent duplicate generation
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { cache } from '@/lib/cache';
import { safeAsync, successResponse, validationError, unauthorizedError } from '@/lib/api-handler';
import { logger } from '@/lib/utils/debug';
import { z } from 'zod';
import { generateReflection, storeReflection } from '@/lib/ai-reflection';
import { getAIContext } from '@/lib/ai/context';
import { attack, getPowerBonus } from '@/lib/services/combatService';

const ReflectionSchema = z.object({
  type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'MILESTONE']).default('DAILY'),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
});

/**
 * POST /api/ai/reflection
 * Generate a new reflection for the user (with deduplication cache)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, localeCode: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Parse and validate request
  const body = await req.json();
  const validation = ReflectionSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid reflection request'
    );
  }

  const { type } = validation.data;

  // Check if we recently generated a reflection for this user/type/date
  // This prevents duplicate generation within a short time window
  const today = new Date().toISOString().split('T')[0];
  const dedupeCacheKey = `reflection:generate:${user.id}:${type}:${today}`;
  
  const recentGeneration = cache.get<any>(dedupeCacheKey);
  if (recentGeneration) {
    logger.debug('[REFLECTION] Using recently generated reflection from cache');
    return successResponse({
      type,
      content: recentGeneration.content,
      generatedAt: recentGeneration.generatedAt,
      cached: true,
    });
  }

  try {
    // Load AI regional context for traceability (v0.27.7)
    const ctx = await getAIContext(user.localeCode || 'en-US');
    logger.debug('[AI_CONTEXT] reflection', { region: ctx.region, locale: ctx.localeCode });

    // Generate reflection
    const content = await generateReflection(user.id, type);

    // Store reflection
    await storeReflection(user.id, type, content);

    // 🎮 Trigger combat attack on reflection generation (fire-and-forget)
    getPowerBonus(user.id)
      .then(powerBonus => attack(user.id, powerBonus))
      .catch(err => logger.debug('[REFLECTION] Combat trigger failed', err));

    const generatedAt = new Date().toISOString();
    
    // Cache the generated reflection for 4 hours to prevent duplicate generation
    cache.set(dedupeCacheKey, { content, generatedAt }, 4 * 3600);
    
    // Invalidate the "latest" cache since we just created a new one
    cache.delete(`reflection:latest:${user.id}`);
    cache.delete(`reflection:latest:${user.id}:${type}`);

    return successResponse({
      type,
      content,
      generatedAt,
      cached: false,
    });
  } catch (error: any) {
    logger.error('[REFLECTION] Generation failed', error);
    return validationError(error.message || 'Failed to generate reflection');
  }
});

/**
 * GET /api/ai/reflection
 * Get user's reflection history (cached for 30 minutes)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Cache key includes user ID, type, and limit
  const cacheKey = `reflection:history:${user.id}:${type || 'all'}:${limit}`;

  // Check cache first
  const cached = cache.get<any>(cacheKey);
  if (cached) {
    return successResponse({
      reflections: cached.reflections,
      count: cached.count,
      cached: true,
    });
  }

  // Build where clause
  const where: any = {
    userId: user.id,
  };

  if (type) {
    where.type = type;
  }

  // Fetch reflections
  const reflections = await prisma.userReflection.findMany({
    where,
    orderBy: { date: 'desc' },
    take: limit,
    select: {
      id: true,
      type: true,
      content: true,
      summary: true,
      sentiment: true,
      date: true,
      createdAt: true,
    },
  });

  const result = {
    reflections,
    count: reflections.length,
  };

  // Cache for 30 minutes (1800 seconds)
  cache.set(cacheKey, result, 1800);

  return successResponse({
    ...result,
    cached: false,
  });
});

