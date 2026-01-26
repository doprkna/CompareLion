import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { UserRole } from "@parel/db/client";

/**
 * Admin Question Validation Endpoint
 * 
 * Mock AI validation for question creation testing.
 * Returns validity score and feedback.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { text, options } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Missing question text" },
        { status: 400 }
      );
    }

    // Validation rules
    const validations = {
      hasText: text.length > 10,
      hasQuestionMark: text.includes("?"),
      notTooLong: text.length < 200,
      hasOptions: options && Array.isArray(options) && options.length >= 2,
      optionsValid: options ? options.every((opt: any) => opt.label && opt.value) : false,
    };

    const validCount = Object.values(validations).filter(Boolean).length;
    const totalChecks = Object.keys(validations).length;
    const score = (validCount / totalChecks);
    const valid = score >= 0.8; // 80% threshold

    // Generate feedback
    const feedback = [];
    if (!validations.hasText) feedback.push("Question text too short (min 10 chars)");
    if (!validations.hasQuestionMark) feedback.push("Question should end with ?");
    if (!validations.notTooLong) feedback.push("Question too long (max 200 chars)");
    if (!validations.hasOptions) feedback.push("Need at least 2 options");
    if (!validations.optionsValid) feedback.push("All options need label and value");

    return NextResponse.json({
      success: true,
      valid,
      score: score.toFixed(2),
      validations,
      feedback,
      aiSuggestion: valid 
        ? "This question looks good for production!"
        : "Consider revising based on feedback above.",
    });
  } catch (error) {
    console.error("[API] Error validating question:", error);
    return NextResponse.json(
      { error: "Failed to validate question" },
      { status: 500 }
    );
  }
}













