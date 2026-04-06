/**
 * Flow Topic config (C17)
 * Maps category slug/name to subtitle and mood for Flow Topic cards
 */

export interface FlowTopicMood {
  subtitle: string;
  /** Tailwind class for card background/border */
  moodClass: string;
  /** C18: optional tag: fun, deep, popular, quick */
  tag?: string;
}

const TOPIC_MAP: Record<string, FlowTopicMood> = {
  starter: { subtitle: 'Questions about your habits and preferences', moodClass: 'bg-accent/10 border-accent/30', tag: 'popular' },
  work: { subtitle: 'Questions about work, ambition and daily challenges', moodClass: 'bg-amber-500/10 border-amber-500/30', tag: 'deep' },
  career: { subtitle: 'Work, ambition and daily challenges', moodClass: 'bg-amber-500/10 border-amber-500/30', tag: 'deep' },
  family: { subtitle: 'Relationships, parenting, and home life', moodClass: 'bg-rose-500/10 border-rose-500/30', tag: 'personal' },
  relationships: { subtitle: 'Relationships and connection', moodClass: 'bg-rose-500/10 border-rose-500/30', tag: 'personal' },
  lifestyle: { subtitle: 'Habits, routines, and health', moodClass: 'bg-emerald-500/10 border-emerald-500/30', tag: 'quick' },
  habits: { subtitle: 'Habits and daily routines', moodClass: 'bg-emerald-500/10 border-emerald-500/30', tag: 'quick' },
  fun: { subtitle: 'Crazy ideas and unexpected questions', moodClass: 'bg-violet-500/10 border-violet-500/30', tag: 'fun' },
  weird: { subtitle: 'Crazy ideas and unexpected questions', moodClass: 'bg-violet-500/10 border-violet-500/30', tag: 'fun' },
  personal: { subtitle: 'Personal reflection and identity', moodClass: 'bg-sky-500/10 border-sky-500/30', tag: 'deep' },
  alpha: { subtitle: 'Alpha feedback and early experience', moodClass: 'bg-amber-500/10 border-amber-500/30', tag: 'quick' },
};

function keyFrom(name: string, slug?: string | null): string {
  const s = (slug || name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const n = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  const parts = [...new Set([s, ...n.split(/\s+/)])];
  for (const p of parts) {
    if (p && TOPIC_MAP[p]) return p;
  }
  return parts[0] || 'default';
}

export function getFlowTopicMood(name: string, slug?: string | null): FlowTopicMood {
  const key = keyFrom(name, slug);
  return TOPIC_MAP[key] ?? {
    subtitle: `${name} — themed questions`,
    moodClass: 'bg-card border-border',
  };
}
