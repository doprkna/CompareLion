import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';

function evaluateBranch(branch: any, answer: any) {
  if (branch.if) {
    if (branch.if.equals !== undefined && answer === branch.if.equals) return true;
    if (branch.if.lte !== undefined && answer <= branch.if.lte) return true;
    if (branch.if.gte !== undefined && answer >= branch.if.gte) return true;
    // Add more operators as needed
  }
  if (branch.default) return 'default';
  return false;
}

// Submit an answer and advance the session (with branching)
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  const { answer } = body;

  // Get session and current step (with branchCondition)
  const session = await prisma.flowProgress.findUnique({
    where: { id },
    include: { currentStep: true },
  });
  if (!session || !session.currentStep) {
    return NextResponse.json({ success: false, message: 'Session or step not found.' }, { status: 404 });
  }

  // Store answer in Answer table
  await prisma.answer.create({
    data: {
      sessionId: session.id,
      stepId: session.currentStep.id,
      questionVersionId: session.currentStep.questionVersionId,
      value: String(answer),
    },
  });

  // Branching logic
  let nextStepId = null;
  let completed = false;
  let nextStep = null;
  let question = null;
  const branchCondition = session.currentStep.branchCondition;
  if (branchCondition && (branchCondition as any).branches) {
    let defaultGoto = null;
    for (const branch of (branchCondition as any).branches) {
      const result = evaluateBranch(branch, answer);
      if (result === true) {
        nextStepId = branch.goto;
        break;
      } else if (result === 'default') {
        defaultGoto = branch.goto;
      }
    }
    if (!nextStepId && defaultGoto) {
      nextStepId = defaultGoto;
    }
    if (nextStepId) {
      nextStep = await prisma.flowStep.findUnique({ where: { id: nextStepId } });
    }
  }

  // Fallback to linear order if no branching or no match
  if (!nextStep) {
    nextStep = await prisma.flowStep.findFirst({
      where: {
        flowId: session.flowId,
        order: { gt: session.currentStep.order },
      },
      orderBy: { order: 'asc' },
    });
    if (nextStep) nextStepId = nextStep.id;
  }

  let updatedSession;
  if (nextStep) {
    updatedSession = await prisma.flowProgress.update({
      where: { id },
      data: {
        currentStepId: nextStep.id,
        updatedAt: new Date(),
      },
    });
    question = await prisma.questionVersion.findUnique({
      where: { id: nextStep.questionVersionId },
    });
    return NextResponse.json({
      success: true,
      sessionId: id,
      currentStepId: nextStep.id,
      question,
      completed: false,
    });
  } else {
    // No more steps: mark as complete
    updatedSession = await prisma.flowProgress.update({
      where: { id },
      data: {
        currentStepId: null,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({
      success: true,
      sessionId: id,
      completed: true,
    });
  }
}
