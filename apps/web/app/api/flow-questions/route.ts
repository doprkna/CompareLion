import { NextRequest } from "next/server";
import { safeAsync, successResponse } from "@/lib/api-handler";
import { filterQuestionsByLocale } from "@/lib/types/question";

export const GET = safeAsync(async (req: NextRequest) => {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "5");
  const locale = url.searchParams.get("locale") || "en";
  const region = url.searchParams.get("region") || "GLOBAL";


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

  // Apply localization filtering
  const filtered = filterQuestionsByLocale(mockQuestions, locale, region);
  
  // Fallback to global questions if no matches
  const questions = filtered.length > 0 
    ? filtered.slice(0, limit)
    : mockQuestions.slice(0, limit);

  return successResponse({ 
    questions,
    meta: {
      locale,
      region,
      totalAvailable: filtered.length,
      fallbackUsed: filtered.length === 0
    }
  });
});
