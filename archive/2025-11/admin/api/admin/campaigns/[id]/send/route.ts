import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: params.id }
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'Campaign already sent' },
        { status: 400 }
      );
    }

    // Update status to sending
    await prisma.marketingCampaign.update({
      where: { id: params.id },
      data: {
        status: 'sending',
        sentAt: new Date()
      }
    });

    // In production, this would trigger the actual email send job
    // For now, we'll just mark it as sent after a brief delay
    // You would typically use a background job queue for this
    
    // Simulate sending process
    setTimeout(async () => {
      try {
        // Get opt-in users
        const users = await prisma.user.findMany({
          where: { newsletterOptIn: true },
          select: { email: true }
        });

        await prisma.marketingCampaign.update({
          where: { id: params.id },
          data: {
            status: 'sent',
            deliveredCount: users.length
          }
        });
      } catch (error) {
        console.error('Error finalizing campaign send:', error);
      }
    }, 5000);

    return NextResponse.json({
      success: true,
      message: 'Campaign queued for sending'
    });

  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}

