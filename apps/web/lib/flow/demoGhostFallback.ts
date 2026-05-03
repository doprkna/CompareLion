import type { AnswerValue, FlowQuestion } from "@/components/flow/QuestionInput";
import { normalizeFlowQuestionType } from "@/components/flow/QuestionInput";

/** Stable id: client-only fallback when `/api/flow/choices` is empty or errors (or guest `/flow-demo`). */
export const DEMO_GHOST_FLOW_CATEGORY_ID = "demo-ghost-flow-local";

/** Prefix for synthetic client-only topic ids (`fallback:*`), never sent to `/api/flow/start`. */
export const DEMO_CLIENT_FALLBACK_ID_PREFIX = "fallback:" as const;

export type DemoGhostReportRow = {
  question: string;
  you: string;
  global: string;
  /** Stable id from `FlowQuestion.id` (`ghost` | `screen` | `job`) for guest breakdown copy. */
  questionId?: string;
};

const GLOBAL_HINT_BY_QID: Record<string, string> = {
  ghost:
    "Global: ~24% say yes (illustrative demo mix—you’ll get real slices after sign-up)",
  screen:
    "Global: most land in the 4–7 band on this scale (demo blend, not your cohort yet)",
  job:
    "Global: “it’s fine” and “neutral” are the most common picks in the demo curve",
};

function ghostQuestionDefs(): Array<
  Omit<FlowQuestion, "text" | "options"> & {
    question: string;
    type: "YES_NO" | "RANGE" | "MULTI_CHOICE";
    options?: FlowQuestion["options"];
  }
> {
  return [
    {
      id: "ghost",
      question: "Have you ever seen a ghost?",
      type: "YES_NO",
    },
    {
      id: "screen",
      question: "Is your screen time normal or a cry for help?",
      type: "RANGE",
    },
    {
      id: "job",
      question: "Do you actually enjoy your job?",
      type: "MULTI_CHOICE",
      options: [
        { id: "job-love", label: "Love it", value: "love" },
        { id: "job-fine", label: "It's fine", value: "fine" },
        { id: "job-meh", label: "Neutral / depends", value: "meh" },
        { id: "job-no", label: "Not really", value: "no" },
      ],
    },
  ];
}

/** Built-in starter questions for `/flow-demo` when the DB has no flow choices. */
export function getDemoGhostQuestions(): FlowQuestion[] {
  return ghostQuestionDefs().map((def) => {
    if (def.type === "YES_NO") {
      return {
        id: def.id,
        text: def.question,
        type: "SINGLE_CHOICE",
        categoryName: "Quick questions",
        options: [
          { id: `${def.id}-yes`, label: "Yes", value: "yes" },
          { id: `${def.id}-no`, label: "No", value: "no" },
        ],
      };
    }
    return {
      id: def.id,
      text: def.question,
      type: def.type,
      categoryName: "Quick questions",
      options: def.options,
    };
  });
}

export function isDemoGhostCategory(categoryId: string | undefined): boolean {
  return categoryId === DEMO_GHOST_FLOW_CATEGORY_ID;
}

/** True when this category must run entirely on the client (no flow start/answer APIs). */
export function isClientOnlyDemoCategory(categoryId: string | undefined): boolean {
  if (categoryId == null || categoryId === "") return false;
  if (categoryId === DEMO_GHOST_FLOW_CATEGORY_ID) return true;
  return categoryId.startsWith(DEMO_CLIENT_FALLBACK_ID_PREFIX);
}

export function formatLocalFallbackYou(
  question: FlowQuestion,
  value: AnswerValue
): string {
  const type = normalizeFlowQuestionType(question.type);
  if (type === "SINGLE_CHOICE" && value.kind === "single") {
    const opt = question.options?.find((o) => o.id === value.optionId);
    return opt?.label ?? value.optionId;
  }
  if (type === "MULTI_CHOICE" && value.kind === "multi") {
    const labels = value.optionIds
      .map((id) => question.options?.find((o) => o.id === id)?.label ?? id)
      .filter(Boolean);
    return labels.length ? labels.join(", ") : "";
  }
  if ((type === "RANGE" || type === "NUMBER") && value.kind === "number") {
    if (value.value == null) return "";
    if (type === "RANGE") {
      const v = Math.min(10, Math.max(1, Math.round(value.value)));
      return `${v}/10`;
    }
    return String(value.value);
  }
  if (type === "TEXT" && value.kind === "text") return value.text.trim();
  return "";
}

export function buildLocalFallbackReportData(rows: DemoGhostReportRow[]): {
  headline: string;
  subheader: string;
  rows: Array<{ question: string; you: string; global: string; questionId?: string }>;
  worldContextRows?: Array<{ label: string; formatted: string }>;
  identityHint: string;
  unlockNote: string;
} {
  return {
    headline: "Here's how you stack up",
    subheader: "Quick demo read—your answers, summarized.",
    rows: rows.map((r) => ({
      question: r.question,
      you: r.you,
      global: r.global,
      questionId: r.questionId,
    })),
    worldContextRows: [
      {
        label: "Sample",
        formatted: "Blended demo curve (not tied to your region yet)",
      },
    ],
    identityHint:
      "Sign in to anchor these comparisons to real cohorts and save your history.",
    unlockNote: "Create an account to save your results.",
  };
}

export function getGlobalHintForDemoQuestion(questionId: string): string {
  return (
    GLOBAL_HINT_BY_QID[questionId] ??
    "Global: mixed responses in the demo (sign in for live cuts)"
  );
}
