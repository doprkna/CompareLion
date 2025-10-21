import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { prisma } from '@/lib/db';

// Debug framework for systematic testing
interface DebugStage {
  stage: string;
  success: boolean;
  timestamp: number;
  data?: any;
  error?: string;
}

interface DebugContext {
  stages: DebugStage[];
  requestId: string;
  startTime: number;
}

function createDebugContext(): DebugContext {
  return {
    stages: [],
    requestId: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    startTime: Date.now()
  };
}

function addDebugStage(context: DebugContext, stage: string, success: boolean, data?: any, error?: string) {
  context.stages.push({
    stage,
    success,
    timestamp: Date.now(),
    data,
    error
  });
  
  if (process.env.DEBUG_API === 'true') {
    console.log(`[DEBUG][${context.requestId}] ${stage}:`, { success, data, error });
  }
}

export async function POST(request: NextRequest) {
  const isDebugMode = process.env.DEBUG_API === 'true';
  const debug = createDebugContext();
  
  try {
    // STAGE 1: Authentication Check
    addDebugStage(debug, 'AUTH_START', true, { timestamp: Date.now() });
    
    const session = await getServerSession(authOptions);
    const hasSession = !!session;
    const hasUser = !!session?.user;
    const userEmail = session?.user?.email;
    
    addDebugStage(debug, 'AUTH_SESSION', hasSession, { 
      hasSession, 
      hasUser, 
      userEmail,
      sessionKeys: session ? Object.keys(session) : []
    });
    
    if (!session?.user?.email) {
      addDebugStage(debug, 'AUTH_FAILED', false, null, 'No session or user email');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          debug: isDebugMode ? { stages: debug.stages } : undefined
        },
        { status: 401 }
      );
    }

    // STAGE 2: User Database Lookup
    addDebugStage(debug, 'USER_LOOKUP_START', true, { email: userEmail });
    
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    } catch (dbError) {
      addDebugStage(debug, 'USER_LOOKUP_ERROR', false, null, dbError instanceof Error ? dbError.message : String(dbError));
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database error finding user',
          debug: isDebugMode ? { stages: debug.stages } : undefined
        },
        { status: 500 }
      );
    }

    addDebugStage(debug, 'USER_LOOKUP_RESULT', !!user, { 
      found: !!user, 
      userId: user?.id, 
      email: user?.email 
    });

    if (!user) {
      addDebugStage(debug, 'USER_NOT_FOUND', false, null, `User not found for email: ${userEmail}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found',
          debug: isDebugMode ? { stages: debug.stages } : undefined
        },
        { status: 404 }
      );
    }

    // STAGE 3: Request Body Parsing
    addDebugStage(debug, 'BODY_PARSE_START', true);
    
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      addDebugStage(debug, 'BODY_PARSE_ERROR', false, null, parseError instanceof Error ? parseError.message : String(parseError));
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body',
          debug: isDebugMode ? { stages: debug.stages } : undefined
        },
        { status: 400 }
      );
    }

    // STAGE 4: Input Sanitization & Type Coercion
    addDebugStage(debug, 'SANITIZATION_START', true);
    
    // Sanitize and coerce all input fields to safe types
    const raw = body;
    const questionId = raw?.questionId ? String(raw.questionId).trim() : null;
    
    // Support both old (optionId) and new (optionIds) format for backwards compatibility
    let optionIds: string[] = [];
    if (raw?.optionIds && Array.isArray(raw.optionIds)) {
      optionIds = raw.optionIds.map((id: any) => String(id).trim()).filter(Boolean);
    } else if (raw?.optionId) {
      // Legacy support: convert single optionId to array
      optionIds = [String(raw.optionId).trim()];
    }
    
    const numericVal = typeof raw?.numericVal === 'number' ? raw.numericVal :
                       typeof raw?.numericVal === 'string' && /^-?\d+(\.\d+)?$/.test(raw.numericVal)
                         ? parseFloat(raw.numericVal)
                         : null;
    
    const textVal = raw?.textVal ? String(raw.textVal).trim() : 
                    raw?.valueText ? String(raw.valueText).trim() : // Legacy support
                    null;
    
    const skipped = Boolean(raw?.skipped);

    addDebugStage(debug, 'SANITIZATION_SUCCESS', true, {
      questionId,
      optionIds,
      numericVal,
      textVal,
      skipped,
      originalTypes: {
        questionId: typeof raw?.questionId,
        optionIds: typeof raw?.optionIds,
        optionId: typeof raw?.optionId,
        numericVal: typeof raw?.numericVal,
        textVal: typeof raw?.textVal,
        valueText: typeof raw?.valueText,
        skipped: typeof raw?.skipped
      }
    });

    // STAGE 5: Input Validation
    addDebugStage(debug, 'VALIDATION_START', true);
    
    if (!questionId) {
      addDebugStage(debug, 'VALIDATION_FAILED', false, null, 'questionId is required');
      return NextResponse.json(
        { 
          success: false, 
          error: 'questionId is required',
          debug: isDebugMode ? { stages: debug.stages } : undefined
        },
        { status: 400 }
      );
    }

    if (!skipped && optionIds.length === 0 && numericVal === null && !textVal) {
      addDebugStage(debug, 'VALIDATION_FAILED', false, null, 'Must provide optionIds, numericVal, textVal, or mark as skipped');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Must provide optionIds, numericVal, textVal, or mark as skipped',
          debug: isDebugMode ? { stages: debug.stages } : undefined
        },
        { status: 400 }
      );
    }

    addDebugStage(debug, 'VALIDATION_SUCCESS', true);

    // STAGE 5: Question Lookup
    addDebugStage(debug, 'QUESTION_LOOKUP_START', true, { questionId });
    
    let question;
    try {
      question = await prisma.flowQuestion.findUnique({
        where: { id: questionId },
      });
    } catch (dbError) {
      addDebugStage(debug, 'QUESTION_LOOKUP_ERROR', false, null, dbError instanceof Error ? dbError.message : String(dbError));
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database error finding question',
          debug: isDebugMode ? { stages: debug.stages } : undefined
        },
        { status: 500 }
      );
    }

    addDebugStage(debug, 'QUESTION_LOOKUP_RESULT', !!question, { 
      found: !!question, 
      isActive: question?.isActive,
      questionId: question?.id,
      questionText: question?.text
    });

    if (!question) {
      // Check if it's a mock question
      if (questionId.startsWith('cmguq4q5d0000inzr3krujckr-')) {
        addDebugStage(debug, 'MOCK_QUESTION_DETECTED', true, { questionId });
        
        // Create a mock response for mock questions
        const mockResponse = {
          id: `mock-response-${Date.now()}`,
          userId: user.id,
          questionId: questionId,
          optionIds: optionIds,
          numericVal: numericVal,
          textVal: textVal,
          skipped: skipped || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addDebugStage(debug, 'MOCK_RESPONSE_CREATED', true, mockResponse);

        const result = {
          success: true,
          response: {
            id: mockResponse.id,
            questionId: mockResponse.questionId,
            skipped: mockResponse.skipped,
            createdAt: mockResponse.createdAt,
          },
          debug: isDebugMode ? { 
            stages: debug.stages,
            mockResponse: true,
            totalTime: Date.now() - debug.startTime
          } : undefined
        };

        return NextResponse.json(result);
      }
      
      addDebugStage(debug, 'QUESTION_NOT_FOUND', false, null, `Question not found: ${questionId}`);
      return NextResponse.json(
        { 
          success: false, 
          error: `Question not found: ${questionId}`,
          debug: isDebugMode ? { stages: debug.stages } : undefined
        },
        { status: 404 }
      );
    }

    if (!question.isActive) {
      addDebugStage(debug, 'QUESTION_INACTIVE', false, null, `Question is not active: ${questionId}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Question is not active',
          debug: isDebugMode ? { stages: debug.stages } : undefined
        },
        { status: 400 }
      );
    }

    // STAGE 6: Option Validation (if optionIds provided)
    if (optionIds.length > 0) {
      addDebugStage(debug, 'OPTION_VALIDATION_START', true, { optionIds, questionId });
      
      try {
        // Validate all provided option IDs belong to this question
        const options = await prisma.flowQuestionOption.findMany({
          where: { 
            id: { in: optionIds },
            questionId: questionId 
          },
        });

        addDebugStage(debug, 'OPTION_VALIDATION_RESULT', options.length === optionIds.length, { 
          foundCount: options.length,
          expectedCount: optionIds.length,
          optionIds,
          questionId
        });

        if (options.length !== optionIds.length) {
          addDebugStage(debug, 'OPTION_INVALID', false, null, `Some optionIds are invalid for this question`);
          return NextResponse.json(
            { 
              success: false, 
              error: 'Some optionIds are invalid for this question',
              debug: isDebugMode ? { stages: debug.stages } : undefined
            },
            { status: 422 }
          );
        }
      } catch (dbError) {
        addDebugStage(debug, 'OPTION_VALIDATION_ERROR', false, null, dbError instanceof Error ? dbError.message : String(dbError));
        return NextResponse.json(
          { 
            success: false, 
            error: 'Database error validating options',
            debug: isDebugMode ? { stages: debug.stages } : undefined
          },
          { status: 500 }
        );
      }
    }

    // STAGE 7: Response Lookup (Check for existing response)
    addDebugStage(debug, 'RESPONSE_LOOKUP_START', true, { userId: user.id, questionId });
    
    let existingResponse;
    try {
      existingResponse = await prisma.userResponse.findFirst({
        where: {
          userId: user.id,
          questionId,
        },
      });
    } catch (dbError) {
      addDebugStage(debug, 'RESPONSE_LOOKUP_ERROR', false, null, dbError instanceof Error ? dbError.message : String(dbError));
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database error finding existing response',
          debug: isDebugMode ? { stages: debug.stages } : undefined
        },
        { status: 500 }
      );
    }

    addDebugStage(debug, 'RESPONSE_LOOKUP_RESULT', true, { 
      found: !!existingResponse,
      existingId: existingResponse?.id
    });

    // STAGE 8: Response Save (Create or Update)
    addDebugStage(debug, 'RESPONSE_SAVE_START', true, { 
      action: existingResponse ? 'UPDATE' : 'CREATE',
      existingId: existingResponse?.id
    });
    
    // DEEP DEBUG LOGGING BEFORE PRISMA CALL
    console.log('======================================');
    console.log('[DEBUG] FULL BODY:', body);
    console.log('[DEBUG] SANITIZED VALUES:');
    console.log('  - questionId:', questionId, '(type:', typeof questionId, ')');
    console.log('  - optionIds:', optionIds, '(type:', typeof optionIds, ')');
    console.log('  - numericVal:', numericVal, '(type:', typeof numericVal, ')');
    console.log('  - textVal:', textVal, '(type:', typeof textVal, ')');
    console.log('  - skipped:', skipped, '(type:', typeof skipped, ')');
    console.log('[DEBUG] PRISMA OPERATION:', existingResponse ? 'UPDATE' : 'CREATE');
    console.log('======================================');
    
    let response;
    try {
      if (existingResponse) {
        console.log('[DEBUG] Updating existing response:', existingResponse.id);
        response = await prisma.userResponse.update({
          where: { id: existingResponse.id },
          data: {
            optionIds: optionIds,
            numericVal: numericVal,
            textVal: textVal,
            skipped: skipped || false,
          },
        });
        addDebugStage(debug, 'RESPONSE_UPDATE_SUCCESS', true, { responseId: response.id });
      } else {
        console.log('[DEBUG] Creating new response for user:', user.id, 'question:', questionId);
        response = await prisma.userResponse.create({
          data: {
            userId: user.id,
            questionId,
            optionIds: optionIds,
            numericVal: numericVal,
            textVal: textVal,
            skipped: skipped || false,
          },
        });
        addDebugStage(debug, 'RESPONSE_CREATE_SUCCESS', true, { responseId: response.id });
      }
      console.log('[DEBUG] Prisma operation SUCCESS. Response ID:', response.id);
    } catch (dbError) {
      // FULL PRISMA ERROR LOGGING
      console.error('======================================');
      console.error('[UPSERT ERROR RAW]', dbError);
      console.error('[ERROR] Full error object:', JSON.stringify(dbError, null, 2));
      console.error('[ERROR] Error message:', dbError instanceof Error ? dbError.message : String(dbError));
      console.error('[ERROR] Error name:', (dbError as any)?.name);
      console.error('[ERROR] Error code:', (dbError as any)?.code);
      console.error('[ERROR] Error meta:', (dbError as any)?.meta);
      console.error('[ERROR] Stack trace:', dbError instanceof Error ? dbError.stack : 'N/A');
      console.error('======================================');
      
      addDebugStage(debug, 'RESPONSE_SAVE_ERROR', false, null, dbError instanceof Error ? dbError.message : String(dbError));
      return NextResponse.json(
        { 
          success: false, 
          stage: 'prisma',
          error: dbError instanceof Error ? dbError.message : 'Database error saving response',
          errorDetails: {
            name: (dbError as any)?.name,
            code: (dbError as any)?.code,
            meta: (dbError as any)?.meta,
            message: dbError instanceof Error ? dbError.message : String(dbError)
          },
          debug: isDebugMode ? { stages: debug.stages } : undefined
        },
        { status: 500 }
      );
    }

    // STAGE 9: Success Response
    addDebugStage(debug, 'SUCCESS_COMPLETE', true, { 
      responseId: response.id, 
      userId: response.userId,
      questionId: response.questionId,
      totalTime: Date.now() - debug.startTime
    });

    const result = {
      success: true,
      response: {
        id: response.id,
        questionId: response.questionId,
        skipped: response.skipped,
        createdAt: response.createdAt,
      },
      debug: isDebugMode ? { 
        stages: debug.stages,
        totalTime: Date.now() - debug.startTime,
        requestId: debug.requestId
      } : undefined
    };

    return NextResponse.json(result);
  } catch (error) {
    addDebugStage(debug, 'UNEXPECTED_ERROR', false, null, error instanceof Error ? error.message : String(error));
    
    console.error('[API] Unexpected error saving answer:', error);
    
    const errorResponse = {
      success: false,
      error: 'Failed to save answer',
      debug: isDebugMode ? { 
        stages: debug.stages,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        totalTime: Date.now() - debug.startTime,
        requestId: debug.requestId
      } : undefined
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

