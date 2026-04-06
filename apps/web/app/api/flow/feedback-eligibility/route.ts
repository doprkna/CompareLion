/**
 * GET /api/flow/feedback-eligibility
 * Returns whether user is eligible to see the Alpha feedback prompt.
 * Guardrails: isBeta OR FEEDBACK_ENABLED; starterFlowCompletedAt set; !feedbackRewardClaimed.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { FEEDBACK_ENABLED } from '@/lib/config';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: true, eligible: false, showPrompt: false });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      isBeta: true,
      starterFlowCompletedAt: true,
      feedbackRewardClaimed: true,
    },
  });
  if (!user) {
    return NextResponse.json({ success: true, eligible: false, showPrompt: false });
  }

  const gateOk = user.isBeta === true || FEEDBACK_ENABLED;
  const completedStarter = !!user.starterFlowCompletedAt;
  const notYetRewarded = !user.feedbackRewardClaimed;

  const eligible = gateOk && completedStarter && notYetRewarded;

  return NextResponse.json({
    success: true,
    eligible,
    showPrompt: eligible,
  });
}
