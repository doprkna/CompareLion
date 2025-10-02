// src/lib/text.ts

export function normalizeQuestionText(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.?!…]+$/u, "") // drop trailing punctuation
    .toLowerCase();
}
