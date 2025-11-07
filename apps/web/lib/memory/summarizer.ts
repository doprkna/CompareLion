type Inputs = {
  reflections: { content?: string | null; summary?: string | null; sentiment?: string | null; createdAt: string | Date }[];
  stats: { totalXP: number; avgLevel: number; reflections: number; memberCount?: number } | null;
  firesides: { count: number };
  polls: { votes: number };
  periodStart: Date;
  periodEnd: Date;
};

export function generateMemoryMarkdown(input: Inputs): { title: string; summary: string; content: string; sourceCount: number } {
  const { reflections, stats, firesides, polls, periodStart, periodEnd } = input;
  const startStr = periodStart.toISOString().slice(0, 10);
  const endStr = periodEnd.toISOString().slice(0, 10);
  const title = `Chronicle ${startStr} → ${endStr}`;

  const recentSnippets = reflections
    .slice(0, 5)
    .map((r) => (r.summary || r.content || '').trim())
    .filter(Boolean)
    .slice(0, 5);

  const moodHints = Array.from(new Set(reflections.map((r) => (r.sentiment || '').toLowerCase()).filter(Boolean))).slice(0, 3);

  const lines: string[] = [];
  lines.push(`# ${title}`);
  if (moodHints.length) {
    lines.push(`Moods: ${moodHints.join(', ')}`);
  }
  if (stats) {
    lines.push(`Group Stats: XP ${stats.totalXP}, Avg Lv ${stats.avgLevel}, Reflections ${stats.reflections}${stats.memberCount ? `, Members ${stats.memberCount}` : ''}.`);
  }
  lines.push(`Firesides: ${firesides.count} reactions • Poll votes: ${polls.votes}.`);
  if (recentSnippets.length) {
    lines.push(`\nHighlights:`);
    for (const snip of recentSnippets) {
      lines.push(`- ${snip.slice(0, 180)}`);
    }
  }

  let content = lines.join('\n');
  const summary = recentSnippets[0]?.slice(0, 140) || `A week from ${startStr} to ${endStr}.`;

  // Cap ~2000 chars
  if (content.length > 2000) content = content.slice(0, 1995) + '...';

  const sourceCount = (reflections?.length || 0) + (stats ? 1 : 0) + firesides.count + polls.votes;
  return { title, summary, content, sourceCount };
}


