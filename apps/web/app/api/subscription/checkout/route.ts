import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { createCheckoutSession, PRICING_PLANS } from '@/lib/stripe';
import { logEvent, TelemetryEvents } from '@/lib/telemetry';
import prisma from '@/lib/db';
import { safeAsync, unauthorizedError, notFoundError, validationError } from '@/lib/api-handler';

/**
 * POST /api/subscription/checkout
 * Create a Stripe checkout session
 */
export const POST = safeAsync(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return notFoundError('User');
  }

  const body = await request.json();
  const { planId } = body;

  // Find the plan
  const plan = PRICING_PLANS.find(p => p.id === planId);
  if (!plan) {
    return validationError('Invalid plan');
  }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create checkout session
    const checkoutSession = await createCheckoutSession(
      user.id,
      user.email,
      plan.stripePriceId,
      `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/subscription/cancelled`
    );

  // Log telemetry
  await logEvent({
    userId: user.id,
    event: TelemetryEvents.PURCHASE_STARTED,
    metadata: {
      planId: plan.id,
      tier: plan.tier,
      price: plan.price,
    },
  });

  return NextResponse.json({
    sessionId: checkoutSession.id,
    url: checkoutSession.url,
  });
});

