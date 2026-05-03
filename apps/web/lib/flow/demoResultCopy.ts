/**
 * Local copy for fallback / guest demo results (no DB, no API).
 * Each (questionId, answerKey) maps to variant[]; one variant is picked per result
 * using a hash of the user's answers (stable for that completion, no hydration roulette).
 */

export type DemoResultVariant = {
  verdict: string;
  statLine: string;
  personalityLine: string;
};

/** Full row in config (variant + quick-read bullet, rotated together). */
export type DemoResultVariantRow = DemoResultVariant & {
  breakdownLine: string;
};

export type DemoResultAnswerCopy = {
  questionId: string;
  answerKey: string;
  variants: DemoResultVariantRow[];
};

/** Shared comparison card body (not rotated). */
export const DEMO_RESULT_SHARED = {
  verdictSubtitle: "Not boring. Statistically efficient.",
  statDescription:
    "Demo blend for now. Sign up to compare by country, age, and life situation.",
  disclaimer: "Demo results use illustrative comparison data.",
  quickReadSectionTitle: "Your quick read",
} as const;

const V = "You're suspiciously average." as const;
const S = "68% answered close to you" as const;

function vz(...rows: DemoResultVariantRow[]): DemoResultVariantRow[] {
  return rows;
}

/** When lookup misses or answerKey is _unknown */
export const DEMO_RESULT_FALLBACK_ENTRY: DemoResultAnswerCopy = {
  questionId: "_fallback",
  answerKey: "_fallback",
  variants: vz(
    {
      verdict: V,
      statLine: S,
      personalityLine: "You're more typical than you think.",
      breakdownLine:
        "You showed up and answered for real—that already counts.",
    },
    {
      verdict: "Suspiciously… normal.",
      statLine: "You’re in the mushy middle of the demo curve.",
      personalityLine: "Comfortably un-special. It’s a flex if you own it.",
      breakdownLine: "Answers logged. Chaos: minimal.",
    },
    {
      verdict: "Congrats. You’re basic—in a scientific way.",
      statLine: "Roughly two-thirds of the demo blob said something similar.",
      personalityLine: "Statistically cuddly. Don’t let it go to your head.",
      breakdownLine: "Nothing wild here—and that’s the whole point.",
    }
  ),
};

/** Table: (questionId, answerKey) → rotating copy variants */
export const DEMO_RESULT_COPY_TABLE: DemoResultAnswerCopy[] = [
  {
    questionId: "ghost",
    answerKey: "yes",
    variants: vz(
      {
        verdict: V,
        statLine: S,
        personalityLine: "You're open-minded. Not haunted yet.",
        breakdownLine: "Ghosts: open-minded, but not fully haunted",
      },
      {
        verdict: V,
        statLine: "~1 in 4 demo-takers nod at ‘ghost’.",
        personalityLine: "Paranormal-curious. Still paying rent in reality.",
        breakdownLine: "Ghosts: entertained, not possessed",
      },
      {
        verdict: "Spooky-curious, evidence-pending.",
        statLine: S,
        personalityLine: "You’ll believe it when it buys you coffee.",
        breakdownLine: "Ghosts: jury’s out, vibes are in",
      }
    ),
  },
  {
    questionId: "ghost",
    answerKey: "no",
    variants: vz(
      {
        verdict: V,
        statLine: S,
        personalityLine: "Ghost-free and proud. The vibes stay indoors.",
        breakdownLine: "Ghosts: firmly on team reality",
      },
      {
        verdict: V,
        statLine: "Mostly earthbound answers in this demo bucket.",
        personalityLine: "Haunted house? Hard pass. Solid call.",
        breakdownLine: "Ghosts: skipped, sanity: retained",
      },
      {
        verdict: V,
        statLine: S,
        personalityLine: "‘No’ with confidence. The ghosts are offended.",
        breakdownLine: "Ghosts: denied entry (politely)",
      }
    ),
  },
  {
    questionId: "screen",
    answerKey: "range-low",
    variants: vz(
      {
        verdict: V,
        statLine: S,
        personalityLine: "Barely online. Suspiciously disciplined.",
        breakdownLine: "Screen time: surprisingly tame (nice discipline)",
      },
      {
        verdict: V,
        statLine: "Low hours gang—in the demo, anyway.",
        personalityLine: "Your thumb could use a vacation. It’s fine.",
        breakdownLine: "Screen time: scarily reasonable",
      },
      {
        verdict: V,
        statLine: S,
        personalityLine: "Touch grass? You might actually do it.",
        breakdownLine: "Screen time: offline flirtation",
      }
    ),
  },
  {
    questionId: "screen",
    answerKey: "range-mid",
    variants: vz(
      {
        verdict: V,
        statLine: S,
        personalityLine: "You're in the 'probably fine' zone.",
        breakdownLine: "Screen time: probably normal, sadly",
      },
      {
        verdict: V,
        statLine: "Average scroll, elite denial skills.",
        personalityLine: "‘Fine’ energy. Famous last words.",
        breakdownLine: "Screen time: coping adequately",
      },
      {
        verdict: V,
        statLine: S,
        personalityLine: "Not a problem until it’s a problem. Classic.",
        breakdownLine: "Screen time: beige flag territory",
      }
    ),
  },
  {
    questionId: "screen",
    answerKey: "range-high",
    variants: vz(
      {
        verdict: V,
        statLine: S,
        personalityLine: "Your feed knows your personality better than you do.",
        breakdownLine: "Screen time: your most-used apps send their regards",
      },
      {
        verdict: V,
        statLine: "Top quartile doomscroll—congrats?",
        personalityLine: "The algorithm didn’t earn you—you earned the algorithm.",
        breakdownLine: "Screen time: main character hours",
      },
      {
        verdict: V,
        statLine: S,
        personalityLine: "Your charger has seen things. Therapy for both of you.",
        breakdownLine: "Screen time: Olympic tier",
      }
    ),
  },
  {
    questionId: "job",
    answerKey: "love",
    variants: vz(
      {
        verdict: V,
        statLine: S,
        personalityLine: "You're doing better than most.",
        breakdownLine: "Work: actually into it",
      },
      {
        verdict: V,
        statLine: "Employed and not miserable? Rarest demo drop.",
        personalityLine: "Ok show-off, your job likes you back.",
        breakdownLine: "Work: suspiciously healthy",
      },
      {
        verdict: V,
        statLine: S,
        personalityLine: "You like work. The internet is taking notes.",
        breakdownLine: "Work: winning a boring lottery",
      }
    ),
  },
  {
    questionId: "job",
    answerKey: "fine",
    variants: vz(
      {
        verdict: V,
        statLine: S,
        personalityLine:
          "Certified 'it's fine'—the mantra of survivors everywhere.",
        breakdownLine: "Work: surviving with style",
      },
      {
        verdict: V,
        statLine: "‘Fine’ is doing heavy lifting in your vocabulary.",
        personalityLine: "It’s fine™. It’s always fine™. Until it isn’t.",
        breakdownLine: "Work: fine-and-dandy defense force",
      },
      {
        verdict: V,
        statLine: S,
        personalityLine: "Neutral? That’s just coping in gray sneakers.",
        breakdownLine: "Work: politely declining drama",
      }
    ),
  },
  {
    questionId: "job",
    answerKey: "grind",
    variants: vz(
      {
        verdict: V,
        statLine: S,
        personalityLine: "Rare honesty about work. The bar is in hell.",
        breakdownLine: "Work: honest about the grind",
      },
      {
        verdict: V,
        statLine: "Brutal truth gang—welcome to the club.",
        personalityLine: "Your honesty is refreshing. HR would sweat.",
        breakdownLine: "Work: telling on the job (nicely)",
      },
      {
        verdict: V,
        statLine: S,
        personalityLine: "Not vibing with work is a personality type now.",
        breakdownLine: "Work: realism damage +10",
      }
    ),
  },
];

const COPY_BY_KEY = new Map<string, DemoResultAnswerCopy>();
for (const row of DEMO_RESULT_COPY_TABLE) {
  COPY_BY_KEY.set(`${row.questionId}:${row.answerKey}`, row);
}

function pickVariantIndex(seed: string, mod: number): number {
  if (mod <= 0) return 0;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % mod;
}

export function makeDemoResultSeed(
  rows: Array<{ questionId?: string; you: string; question?: string }>
): string {
  return rows
    .map((r) => `${inferDemoResultQuestionId(r) ?? "?"}:${r.you.trim()}`)
    .join("|");
}

function getAnswerCopyEntry(
  questionId: string,
  answerKey: string
): DemoResultAnswerCopy {
  return (
    COPY_BY_KEY.get(`${questionId}:${answerKey}`) ??
    DEMO_RESULT_FALLBACK_ENTRY
  );
}

function pickVariantFromEntry(
  entry: DemoResultAnswerCopy,
  seed: string
): DemoResultVariantRow {
  const list = entry.variants;
  if (!list.length) {
    return DEMO_RESULT_FALLBACK_ENTRY.variants[0]!;
  }
  const i = pickVariantIndex(
    `${seed}|${entry.questionId}|${entry.answerKey}`,
    list.length
  );
  return list[i]!;
}

/** Picks one variant for this answer; stable for the same seed + id + you text. */
export function pickDemoResultVariantForAnswer(
  questionId: string | undefined,
  answerYou: string,
  seed: string
): DemoResultVariantRow {
  const id = questionId?.trim().toLowerCase();
  if (!id) return pickVariantFromEntry(DEMO_RESULT_FALLBACK_ENTRY, seed);
  const key = deriveDemoResultAnswerKey(id, answerYou);
  const entry = getAnswerCopyEntry(id, key);
  return pickVariantFromEntry(entry, seed);
}

export function inferDemoResultQuestionId(r: {
  questionId?: string;
  question?: string;
}): string | undefined {
  if (r.questionId) return r.questionId;
  const q = r.question?.toLowerCase() ?? "";
  if (q.includes("ghost")) return "ghost";
  if (q.includes("screen")) return "screen";
  if (q.includes("job")) return "job";
  return undefined;
}

/** Map stored answer text to table answerKey. */
export function deriveDemoResultAnswerKey(
  questionId: string | undefined,
  answerYou: string
): string {
  const id = questionId?.trim().toLowerCase();
  const you = answerYou.trim();
  if (!id) return "_unknown";

  if (id === "ghost") {
    if (/^yes$/i.test(you) || /\byes\b/i.test(you)) return "yes";
    if (/^no$/i.test(you) || /\bno\b/i.test(you)) return "no";
    return "_unknown";
  }

  if (id === "screen") {
    const m = you.match(/(\d+)\s*\/\s*10/);
    const n = m ? parseInt(m[1], 10) : 5;
    if (n <= 3) return "range-low";
    if (n >= 8) return "range-high";
    return "range-mid";
  }

  if (id === "job") {
    const y = you.toLowerCase();
    if (y.includes("love")) return "love";
    if (
      y.includes("fine") ||
      y.includes("neutral") ||
      y.includes("depend")
    ) {
      return "fine";
    }
    if (y.includes("not") || y.includes("no")) return "grind";
    return "_unknown";
  }

  return "_unknown";
}

const FB_FIRST_PERSONALITY = DEMO_RESULT_FALLBACK_ENTRY.variants[0]!.personalityLine;

/** Prefer job → screen → ghost; skip rows that only map to generic unknown key for that question. */
export function pickDemoResultPersonalityLine(
  rows: Array<{ questionId?: string; you: string; question?: string }>,
  seed: string
): string {
  const order = ["job", "screen", "ghost"] as const;
  for (const qid of order) {
    const row = rows.find((r) => inferDemoResultQuestionId(r) === qid);
    if (!row) continue;
    const key = deriveDemoResultAnswerKey(qid, row.you);
    if (key === "_unknown") continue;
    const v = pickDemoResultVariantForAnswer(qid, row.you, seed);
    if (v.personalityLine !== FB_FIRST_PERSONALITY) return v.personalityLine;
  }
  for (const qid of order) {
    const row = rows.find((r) => inferDemoResultQuestionId(r) === qid);
    if (!row) continue;
    return pickDemoResultVariantForAnswer(qid, row.you, seed).personalityLine;
  }
  return pickVariantFromEntry(DEMO_RESULT_FALLBACK_ENTRY, seed).personalityLine;
}

export function getGuestDemoBreakdownLinesFromCopy(
  rows: Array<{ questionId?: string; you: string; question?: string }>,
  seed: string
): string[] {
  const lines: string[] = [];
  for (const r of rows) {
    const id = inferDemoResultQuestionId(r);
    if (!id) continue;
    lines.push(pickDemoResultVariantForAnswer(id, r.you, seed).breakdownLine);
  }
  if (lines.length === 0) {
    return [pickVariantFromEntry(DEMO_RESULT_FALLBACK_ENTRY, seed).breakdownLine];
  }
  return lines.slice(0, 3);
}

export type GuestDemoResultCopyView = {
  verdictTitle: string;
  verdictSubtitle: string;
  statTitle: string;
  statDescription: string;
  personalityLine: string;
  breakdownLines: string[];
  disclaimer: string;
  quickReadSectionTitle: string;
};

/** All guest client-only result strings derived from report rows + this file. */
export function resolveGuestDemoResultCopy(
  rows: Array<{ questionId?: string; you: string; question?: string }>
): GuestDemoResultCopyView {
  const seed = makeDemoResultSeed(rows);
  const head = rows[0];
  const base = head
    ? pickDemoResultVariantForAnswer(
        inferDemoResultQuestionId(head),
        head.you,
        seed
      )
    : pickVariantFromEntry(DEMO_RESULT_FALLBACK_ENTRY, seed);

  return {
    verdictTitle: base.verdict,
    verdictSubtitle: DEMO_RESULT_SHARED.verdictSubtitle,
    statTitle: base.statLine,
    statDescription: DEMO_RESULT_SHARED.statDescription,
    personalityLine: pickDemoResultPersonalityLine(rows, seed),
    breakdownLines: getGuestDemoBreakdownLinesFromCopy(rows, seed),
    disclaimer: DEMO_RESULT_SHARED.disclaimer,
    quickReadSectionTitle: DEMO_RESULT_SHARED.quickReadSectionTitle,
  };
}
