// apps/web/lib/prompts/generateQuestions.ts

export function buildPrompt(ctx: {
  names: string[];
  locale?: string;
  targetCount: number;
}) {
  const path = ctx.names.join(' > ');
  return {
    system: `You generate concise, clear, non-duplicated questions.\nOutput ONLY JSON matching the provided schema. No prose.`,
    user: `
Context Path: ${path}
Locale: ${ctx.locale ?? 'en'}

Generate ${ctx.targetCount} questions users can answer quickly (one sentence).
Avoid overlap; cover breadth.
Each item: { "text": "...", "difficulty": "easy|medium|hard" (optional) }.

Return:
{
  "ssscId": "<echo input>",
  "questions": [ { "text": "...", "difficulty": "..." }, ... ]
}
`.trim(),
  };
}
