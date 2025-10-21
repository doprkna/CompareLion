/**
 * Lore Engine (v0.11.17)
 * 
 * PLACEHOLDER: Dynamic narrative and world storytelling.
 */

/**
 * Sample lore stories
 */
export const SAMPLE_LORE = [
  {
    title: "The Founding of PareL",
    slug: "founding-of-parel",
    summary: "In the beginning, there was chaos. Questions unanswered, knowledge scattered.",
    content: `# The Founding of PareL

In the age before memory, the world was divided. Questions floated in the void, seeking answers that would never come. Knowledge was power, but power was hoarded.

Then came the Founders—three seekers who believed in a different way. They created PareL, a realm where questions would flow freely, where every answer would build toward something greater.

The first pillar was **Truth**: face reality without fear.
The second pillar was **Dare**: challenge yourself beyond comfort.
The third pillar was **Growth**: never stop evolving.

And so PareL was born, a place where curiosity became currency, and wisdom became power.`,
    category: "history",
    importance: 5,
    tags: ["founding", "history", "truth"],
  },
  {
    title: "The First Archetype",
    slug: "first-archetype",
    summary: "How the Adventurer emerged from the void.",
    content: `# The First Archetype

Every journey begins with a single step. In PareL, every hero begins as **The Adventurer**.

Balanced, curious, undefined—The Adventurer represents pure potential. As you answer questions, complete challenges, and explore the world, your path diverges.

Will you become The Scholar, devoted to knowledge?
The Bard, master of social connection?
Or perhaps The Sage, blending wisdom with creativity?

Your choices shape your destiny. Your archetype evolves with you.`,
    category: "character",
    importance: 4,
    tags: ["archetype", "character", "evolution"],
  },
  {
    title: "The Karma Wars",
    slug: "karma-wars",
    summary: "When alignment divided the world.",
    content: `# The Karma Wars

Long ago, the community split along moral lines. Those who valued compassion and truth formed the Light faction. Those who embraced chaos and freedom became the Shadow.

For years they battled—not with swords, but with choices. Every answer, every challenge, every decision shifted the balance.

The wars ended not with victory, but with understanding. Both sides realized that neither path was wrong—only different.

Today, karma still flows through PareL. But the wars are over. Now, alignment is personal, not political.`,
    category: "history",
    importance: 4,
    tags: ["karma", "faction", "war", "history"],
  },
  {
    title: "The Treasury's Purpose",
    slug: "treasury-purpose",
    summary: "Why every transaction feeds the greater good.",
    content: `# The Treasury's Purpose

In the early days, PareL's economy was wild and unbalanced. The rich grew richer. The poor struggled to compete.

Then the Council proposed a solution: **The Global Treasury**.

Every marketplace sale, every subscription, every cosmetic purchase—all would contribute 5% to a shared fund. This fund would:

- Power community events
- Fund new content
- Reward creators
- Support infrastructure

The treasury belongs to everyone. It grows with prosperity and shrinks with generosity.

Today, it stands as a symbol of collective progress.`,
    category: "event",
    importance: 3,
    tags: ["economy", "treasury", "community"],
  },
  {
    title: "The Polymath Legend",
    slug: "polymath-legend",
    summary: "The rarest archetype and its legendary power.",
    content: `# The Polymath Legend

Of all the archetypes in PareL, one stands above the rest: **The Polymath**.

To achieve this state, a player must master all five hero stats simultaneously—Sleep, Health, Social, Knowledge, and Creativity. All above 50, all balanced.

The Polymath gains +7% XP on all actions—the highest passive bonus in the game.

But the path is difficult. Most players specialize, becoming Scholars or Bards. Few have the discipline to balance all aspects of growth.

Legends say only three players have ever achieved true Polymath status.

Will you be the fourth?`,
    category: "character",
    importance: 5,
    tags: ["archetype", "polymath", "legend", "challenge"],
  },
  {
    title: "The Great Inflation Crisis",
    slug: "inflation-crisis",
    summary: "How the economy nearly collapsed.",
    content: `# The Great Inflation Crisis

In Year 2 of PareL, disaster struck. A bug in the quest system granted 10x gold rewards.

Within 24 hours, the economy exploded. Prices skyrocketed. New players couldn't afford basic items. The marketplace froze.

The admins acted swiftly:
1. Disabled the bugged quests
2. Implemented dynamic pricing
3. Activated emergency tax rates
4. Rolled back exploited gains

Within a week, stability returned. Dynamic pricing was born from crisis.

Today, inflation is monitored daily. The economy adapts in real-time.

Never again.`,
    category: "history",
    importance: 4,
    tags: ["economy", "crisis", "history"],
  },
  {
    title: "The First Totem",
    slug: "first-totem",
    summary: "How group play changed everything.",
    content: `# The First Totem

Before totems, PareL was lonely. Players competed individually, rarely collaborating.

Then five friends decided to try something new. They formed **The Phoenix Alliance**—the first group totem.

Together, they:
- Shared XP strategies
- Coordinated challenges
- Supported each other's growth

Within a month, they dominated the leaderboard. Other players noticed. Soon, totems appeared everywhere.

Today, totems are the heart of PareL's social ecosystem. Solo play still exists, but community is king.

The Phoenix Alliance still stands—now legendary, forever first.`,
    category: "event",
    importance: 4,
    tags: ["totem", "community", "social", "history"],
  },
  {
    title: "The Creator Manifesto",
    slug: "creator-manifesto",
    summary: "Why creators deserve to earn.",
    content: `# The Creator Manifesto

PareL thrives on community content. Flow creators design questions. Challenge creators craft duels. Theme creators build beauty.

They deserve compensation.

The Creator Economy was born from this principle:

**30% of subscriptions → Creator pool**
**20% of cosmetic sales → Creator pool**
**100% of donations → Creator pool**

Every week, the pool distributes based on engagement:
- Views
- Completions
- Likes
- Shares

Quality content rises. Spam falls. Creators earn. Community wins.

This is the way.`,
    category: "event",
    importance: 3,
    tags: ["creator", "economy", "community"],
  },
  {
    title: "The Retention Revelation",
    slug: "retention-revelation",
    summary: "The science of keeping players engaged.",
    content: `# The Retention Revelation

PareL's designers studied the psychology of habit formation. They discovered three keys:

1. **Streaks**: Consecutive action builds commitment
2. **Rewards**: Small, frequent wins maintain dopamine
3. **Summaries**: Reflection creates meaning

Thus was born:
- Daily login streaks (🔥)
- 7-day reward calendars
- Return bonuses for the absent
- Daily summaries showing growth

Players who engage with these systems stay 3x longer than those who don't.

Retention isn't manipulation—it's helping players see their own progress.`,
    category: "event",
    importance: 3,
    tags: ["retention", "psychology", "design"],
  },
  {
    title: "The Moderation Compact",
    slug: "moderation-compact",
    summary: "Community rules and self-governance.",
    content: `# The Moderation Compact

As PareL grew, conflict arose. Spam, harassment, cheating—the shadows of community.

The Council established the **Moderation Compact**, a system of checks and balances:

**Reputation**: Every action affects your standing
**Reports**: Community can flag bad actors
**AI Review**: First line of defense
**Human Moderators**: Final judgment
**Transparency**: Weekly public summaries

The compact works because it's fair:
- Warnings before bans
- Appeals allowed
- Public accountability
- Gradual escalation

Today, PareL remains one of the safest communities online.`,
    category: "event",
    importance: 4,
    tags: ["moderation", "community", "safety"],
  },
];

/**
 * Get lore entry by slug
 */
export async function getLoreEntry(slug: string) {
  console.log("[Lore] PLACEHOLDER: Would get lore entry", { slug });
  
  // PLACEHOLDER: Would execute
  // const entry = await prisma.loreEntry.findUnique({
  //   where: { slug },
  //   include: {
  //     era: true,
  //     tags: true,
  //   },
  // });
  // 
  // if (entry && entry.isPublished) {
  //   // Increment view count
  //   await prisma.loreEntry.update({
  //     where: { id: entry.id },
  //     data: { viewCount: { increment: 1 } },
  //   });
  // }
  // 
  // return entry;
  
  return null;
}

/**
 * Get all published lore entries
 */
export async function getPublishedLore(options?: {
  category?: string;
  eraId?: string;
  tags?: string[];
  limit?: number;
}) {
  console.log("[Lore] PLACEHOLDER: Would get published lore", options);
  
  // PLACEHOLDER: Would execute
  // const entries = await prisma.loreEntry.findMany({
  //   where: {
  //     isPublished: true,
  //     isSecret: false,
  //     category: options?.category,
  //     eraId: options?.eraId,
  //     tags: options?.tags
  //       ? {
  //           some: {
  //             tag: { in: options.tags },
  //           },
  //         }
  //       : undefined,
  //   },
  //   include: {
  //     era: true,
  //     tags: true,
  //   },
  //   orderBy: [
  //     { importance: "desc" },
  //     { publishedAt: "desc" },
  //   ],
  //   take: options?.limit || 100,
  // });
  // 
  // return entries;
  
  return [];
}

/**
 * Search lore
 */
export async function searchLore(query: string) {
  console.log("[Lore] PLACEHOLDER: Would search lore", { query });
  
  // PLACEHOLDER: Would execute
  // const entries = await prisma.loreEntry.findMany({
  //   where: {
  //     isPublished: true,
  //     isSecret: false,
  //     OR: [
  //       { title: { contains: query, mode: "insensitive" } },
  //       { summary: { contains: query, mode: "insensitive" } },
  //       { content: { contains: query, mode: "insensitive" } },
  //     ],
  //   },
  //   include: {
  //     era: true,
  //     tags: true,
  //   },
  //   orderBy: {
  //     importance: "desc",
  //   },
  //   take: 20,
  // });
  // 
  // return entries;
  
  return [];
}

/**
 * Seed sample lore
 */
export async function seedSampleLore() {
  console.log("[Lore] PLACEHOLDER: Would seed sample lore");
  
  // PLACEHOLDER: Would execute
  // // Create Season I era
  // const era = await prisma.loreEra.create({
  //   data: {
  //     name: "season_1",
  //     displayName: "Season I: The Awakening",
  //     description: "The birth of PareL and its foundational systems",
  //     order: 1,
  //     startYear: 2025,
  //     isCurrent: true,
  //     icon: "🌅",
  //     color: "#FF6B6B",
  //   },
  // });
  // 
  // // Create lore entries
  // for (const story of SAMPLE_LORE) {
  //   const entry = await prisma.loreEntry.create({
  //     data: {
  //       title: story.title,
  //       slug: story.slug,
  //       summary: story.summary,
  //       content: story.content,
  //       eraId: era.id,
  //       category: story.category,
  //       importance: story.importance,
  //       author: "System",
  //       isPublished: true,
  //       publishedAt: new Date(),
  //     },
  //   });
  //   
  //   // Add tags
  //   for (const tag of story.tags) {
  //     await prisma.loreTag.create({
  //       data: {
  //         entryId: entry.id,
  //         tag,
  //       },
  //     });
  //   }
  // }
}











