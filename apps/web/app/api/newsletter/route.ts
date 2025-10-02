export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromCookie } from '@/lib/auth/session';
import { createNewsletterProvider } from '@/lib/newsletter/providers';
import { logAuditEvent, extractIpFromRequest } from '@/lib/services/auditService';
import { z } from 'zod';

const NewsletterOptInSchema = z.object({
  optIn: z.boolean()
});

export async function POST(req: NextRequest) {
  try {
    // Get the current user from session
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate input
    const validationResult = NewsletterOptInSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    const { optIn } = validationResult.data;
    const ip = extractIpFromRequest(req);

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, newsletterOptIn: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the opt-in status is actually changing
    if (user.newsletterOptIn === optIn) {
      return NextResponse.json({
        success: true,
        message: `Newsletter subscription is already ${optIn ? 'enabled' : 'disabled'}`
      });
    }

    // Get newsletter provider
    const provider = createNewsletterProvider();
    
    if (provider) {
      // Sync with newsletter provider
      const providerResult = optIn 
        ? await provider.subscribe(user.email, user.name || undefined)
        : await provider.unsubscribe(user.email);

      if (!providerResult.success) {
        console.error('Newsletter provider sync failed:', providerResult.error);
        // Continue with database update even if provider sync fails
      } else {
        console.log(`Newsletter provider sync successful for ${user.email}: ${optIn ? 'subscribed' : 'unsubscribed'}`);
      }
    } else {
      console.warn('No newsletter provider configured. Newsletter preference will be stored locally only.');
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

    return NextResponse.json({
      success: true,
      message: `Newsletter subscription ${optIn ? 'enabled' : 'disabled'} successfully`,
      providerSynced: !!provider
    });
  } catch (error) {
    console.error('Newsletter opt-in/out error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update newsletter preference' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get the current user from session
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's newsletter preference
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { newsletterOptIn: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      newsletterOptIn: user.newsletterOptIn
    });
  } catch (error) {
    console.error('Newsletter preference fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch newsletter preference' },
      { status: 500 }
    );
  }
}
