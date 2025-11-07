import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, validationError } from '@/lib/api-handler';

export const POST = safeAsync(async (request: NextRequest) => {
  const body = await request.json();
  const { email, refCode, source } = body;

  // Validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return validationError('Valid email is required');
  }

  // Check if already on waitlist
  const existing = await prisma.waitlist.findUnique({
    where: { email }
  });

  if (existing) {
    return successResponse(
      { alreadyExists: true },
      'You are already on the waitlist!'
    );
  }

  // Add to waitlist
  const waitlistEntry = await prisma.waitlist.create({
    data: {
      email,
      refCode: refCode || null,
      source: source || 'landing',
      status: 'pending'
    }
  });

  // If there's a referral code, track it (fire and forget)
  if (refCode) {
    prisma.user.findFirst({
      where: { 
        OR: [
          { inviteCode: refCode },
          { id: refCode }
        ]
      }
    }).then(referrer => {
      if (referrer) {
        return prisma.eventLog.create({
          data: {
            userId: referrer.id,
            eventType: 'WAITLIST_REFERRAL',
            eventData: {
              email,
              waitlistId: waitlistEntry.id
            }
          }
        });
      }
    }).catch(() => {
      // Silently fail - referral tracking is not critical
    });
  }

  return successResponse(
    { id: waitlistEntry.id },
    'Successfully joined the waitlist!'
  );
});

export const GET = safeAsync(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (email) {
    // Check if email is on waitlist
    const entry = await prisma.waitlist.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true
      }
    });

    return successResponse({
      exists: !!entry,
      entry: entry || null
    });
  }

  // Return count for public display
  const count = await prisma.waitlist.count({
    where: { status: 'pending' }
  });

  return successResponse({ count });
});

