export type PublicFlowResultSnapshot = {
  hookLine: string;
  insightTitle: string;
  insightSubtitle: string;
  archetypeLabel: string;
  moodLabel: string;
  ambientLine: string;
};

export function toPublicFlowSnapshot(raw: unknown): PublicFlowResultSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const req = ['hookLine', 'insightTitle', 'insightSubtitle', 'archetypeLabel', 'moodLabel', 'ambientLine'];
  for (const k of req) {
    if (typeof o[k] !== 'string' || !String(o[k]).trim()) return null;
  }
  return {
    hookLine: String(o.hookLine).trim(),
    insightTitle: String(o.insightTitle).trim(),
    insightSubtitle: String(o.insightSubtitle).trim(),
    archetypeLabel: String(o.archetypeLabel).trim(),
    moodLabel: String(o.moodLabel).trim(),
    ambientLine: String(o.ambientLine).trim(),
  };
}
