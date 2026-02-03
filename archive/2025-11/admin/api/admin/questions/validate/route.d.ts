import { NextRequest, NextResponse } from "next/server";
/**
 * Admin Question Validation Endpoint
 *
 * Mock AI validation for question creation testing.
 * Returns validity score and feedback.
 */
export declare function POST(req: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    valid: boolean;
    score: string;
    validations: {
        hasText: boolean;
        hasQuestionMark: any;
        notTooLong: boolean;
        hasOptions: any;
        optionsValid: any;
    };
    feedback: string[];
    aiSuggestion: string;
}>>;
