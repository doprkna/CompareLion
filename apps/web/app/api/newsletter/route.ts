export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromCookie } from '@/lib/auth/session';
import { createNewsletterProvider } from '@/lib/newsletter/providers';
import { logAuditEvent, extractIpFromRequest } from '@/lib/services/auditService';
import { z } from 'zod';
import { logger } from '@/lib/utils/debug';
import { safeAsync, successResponse, errorResponse, authError, notFoundError } from '@/lib/api-handler';

const NewsletterOptInSchema = z.object({
  optIn: z.boolean()
});

export const POST = safeAsync(async (req: NextRequest) => {
  // Get the current user from session
  const session = await getSessionFromCookie();
  if (!session) {
    return authError('Authentication required');
  }

  const body = await req.json();
  
  // Validate input
  const validationResult = NewsletterOptInSchema.safeParse(body);
  if (!validationResult.success) {
    return errorResponse('Invalid input data', 400, 'VALIDATION_ERROR');
  }

  const { optIn } = validationResult.data;
  const ip = extractIpFromRequest(req);

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, newsletterOptIn: true }
  });

  if (!user) {
    return notFoundError('User');
  }

  // Check if the opt-in status is actually changing
  if (user.newsletterOptIn === optIn) {
    return successResponse(
      null,
      `Newsletter subscription is already ${optIn ? 'enabled' : 'disabled'}`
    );
  }

  // Get newsletter provider
  const provider = createNewsletterProvider();
  
  if (provider) {
    // Sync with newsletter provider
    const providerResult = optIn 
      ? await provider.subscribe(user.email, user.name || undefined)
      : await provider.unsubscribe(user.email);

    if (!providerResult.success) {
      logger.error('[Newsletter] Provider sync failed', undefined, { error: providerResult.error });
      // Continue with database update even if provider sync fails
    }
  } else {
    logger.warn('[Newsletter] No provider configured - storing locally only');
  }

  // Update user's newsletter preference in database
  await prisma.user.update({
    where: { id: user.id },
    data: { newsletterOptIn: optIn }
  });

  // Log newsletter preference change
  await logAuditEvent({
    userId: user.id,
    ip,
    action: optIn ? 'newsletter_opt_in' : 'newsletter_opt_out',
    meta: { 
      email: user.email, 
      optIn,
      providerSynced: !!provider,
      providerName: provider ? provider.constructor.name : null
    },
  });

  return successResponse(
    { providerSynced: !!provider },
    `Newsletter subscription ${optIn ? 'enabled' : 'disabled'} successfully`
  );
});

export const GET = safeAsync(async (_req: NextRequest) => {
  // Get the current user from session
  const session = await getSessionFromCookie();
  if (!session) {
    return authError('Authentication required');
  }

  // Get user's newsletter preference
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { newsletterOptIn: true }
  });

  if (!user) {
    return notFoundError('User');
  }

  return successResponse({
    newsletterOptIn: user.newsletterOptIn
  });
});
