import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "5");
    const locale = url.searchParams.get("locale") || "en";

    console.log(`[flow-questions] Fetching ${limit} questions for locale: ${locale}`);

    // Mock questions with proper CUID-like IDs that will work with flow-answers API
    const mockQuestions = [
      {
        id: "cmguq4q5d0000inzr3krujckr-1",
        text: "What is your favorite programming language?",
        type: "SINGLE_CHOICE",
        locale: "en",
        isActive: true,
        options: [
          { id: "cmguq4q5d0000inzr3krujckr-opt-1", label: "JavaScript", value: "javascript", order: 0 },
          { id: "cmguq4q5d0000inzr3krujckr-opt-2", label: "Python", value: "python", order: 1 },
          { id: "cmguq4q5d0000inzr3krujckr-opt-3", label: "TypeScript", value: "typescript", order: 2 },
          { id: "cmguq4q5d0000inzr3krujckr-opt-4", label: "Go", value: "go", order: 3 }
        ]
      },
      {
        id: "cmguq4q5d0000inzr3krujckr-2", 
        text: "How many years of experience do you have?",
        type: "SINGLE_CHOICE",
        locale: "en",
        isActive: true,
        options: [
          { id: "cmguq4q5d0000inzr3krujckr-opt-5", label: "0-1 years", value: "0-1", order: 0 },
          { id: "cmguq4q5d0000inzr3krujckr-opt-6", label: "2-5 years", value: "2-5", order: 1 },
          { id: "cmguq4q5d0000inzr3krujckr-opt-7", label: "6-10 years", value: "6-10", order: 2 },
          { id: "cmguq4q5d0000inzr3krujckr-opt-8", label: "10+ years", value: "10+", order: 3 }
        ]
      },
      {
        id: "cmguq4q5d0000inzr3krujckr-3",
        text: "What type of projects do you enjoy most?",
        type: "SINGLE_CHOICE", 
        locale: "en",
        isActive: true,
        options: [
          { id: "cmguq4q5d0000inzr3krujckr-opt-9", label: "Web Development", value: "web", order: 0 },
          { id: "cmguq4q5d0000inzr3krujckr-opt-10", label: "Mobile Apps", value: "mobile", order: 1 },
          { id: "cmguq4q5d0000inzr3krujckr-opt-11", label: "Data Science", value: "data", order: 2 },
          { id: "cmguq4q5d0000inzr3krujckr-opt-12", label: "DevOps", value: "devops", order: 3 }
        ]
      }
    ];

    const questions = mockQuestions.slice(0, limit);

    console.log(`[flow-questions] Found ${questions.length} questions`);

    return NextResponse.json({ 
      success: true,
      questions 
    });
  } catch (err: any) {
    console.error("[API Error][flow-questions]", err);
    return NextResponse.json({ 
      success: false,
      error: err.message || "Failed to fetch flow questions" 
    }, { status: 500 });
  }
}
