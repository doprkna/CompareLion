/**
 * Tag System v1 - Semantic labels for questions
 * Tags: lowercase, short, single concept, no spaces (use hyphen)
 */

const MAX_TAG_LENGTH = 32;
const MAX_TAGS_PER_QUESTION = 10;

/**
 * Normalize a single tag per rules:
 * - lowercase
 * - short
 * - single concept
 * - no spaces (use hyphen)
 */
export function normalizeTag(raw: string): string | null {
  if (typeof raw !== 'string') return null;
  let t = raw.trim().toLowerCase();
  if (!t) return null;
  t = t.replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '').replace(/-+/g, '-');
  if (!t) return null;
  if (t.length > MAX_TAG_LENGTH) t = t.slice(0, MAX_TAG_LENGTH);
  return t;
}

/**
 * Normalize and deduplicate tags. Returns valid unique tags.
 */
export function normalizeTags(raw: string[]): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of raw) {
    const n = normalizeTag(r);
    if (n && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out.slice(0, MAX_TAGS_PER_QUESTION);
}
