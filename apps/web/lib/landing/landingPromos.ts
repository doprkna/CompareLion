export type LandingPromo = {
  id: string;
  slot: "hero-right" | "below-hero" | "footer";
  type: "result" | "announcement" | "visual" | "link";
  title: string;
  eyebrow?: string;
  body?: string;
  lines?: string[];
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  active: boolean;
  priority: number;
  startsAt?: string;
  endsAt?: string;
  tags?: string[];
};

export type LandingPromoSlot = LandingPromo["slot"];

function isExternalHref(href: string): boolean {
  const h = href.trim();
  return (
    /^https?:\/\//i.test(h) ||
    h.startsWith("//") ||
    h.startsWith("mailto:") ||
    h.startsWith("tel:")
  );
}

export { isExternalHref };

const SLOT_FALLBACK: Record<LandingPromoSlot, LandingPromo> = {
  "hero-right": {
    id: "fallback-hero-right",
    slot: "hero-right",
    type: "link",
    title: "See where you land",
    eyebrow: "Comparison",
    body: "Answer a few honest questions and stack yourself against strangers—no polished feed required.",
    ctaLabel: "Find out if you're normal",
    ctaHref: "/flow-demo",
    active: true,
    priority: 0,
  },
  "below-hero": {
    id: "fallback-below-hero",
    slot: "below-hero",
    type: "link",
    title: "What is PareL?",
    body: "A lightweight place to compare real-life answers—funny, uncomfortable, or dead serious.",
    ctaLabel: "Learn more",
    ctaHref: "/faq",
    active: true,
    priority: 0,
  },
  footer: {
    id: "fallback-footer",
    slot: "footer",
    type: "link",
    title: "About this project",
    body: "PareL is deliberately small: questions, comparisons, and the occasional reality check.",
    ctaLabel: "About",
    ctaHref: "/about",
    active: true,
    priority: 0,
  },
};

export const LANDING_PROMOS: LandingPromo[] = [
  {
    id: "hero-job-result",
    slot: "hero-right",
    type: "result",
    title: "You enjoy your job",
    lines: [
      "63% of people don't",
      "You're more satisfied than average",
      "That's… rare.",
    ],
    ctaLabel: "Find out if you're normal",
    ctaHref: "/flow-demo",
    active: true,
    priority: 100,
    tags: ["result", "jobs"],
  },
  {
    id: "below-faq",
    slot: "below-hero",
    type: "link",
    title: "What is PareL?",
    body: "A social comparison game for weirdly honest questions.",
    ctaLabel: "Read FAQ",
    ctaHref: "/faq",
    active: true,
    priority: 90,
  },
  {
    id: "below-release",
    slot: "below-hero",
    type: "announcement",
    title: "Alpha is live",
    body: "The first public version is being prepared for testers.",
    ctaLabel: "Release notes",
    ctaHref: "/changelog",
    active: true,
    priority: 80,
  },
  {
    id: "below-pricing",
    slot: "below-hero",
    type: "link",
    title: "Free first",
    body: "Basic comparisons stay free. Premium comes later.",
    ctaLabel: "Pricing idea",
    ctaHref: "/pricing",
    active: true,
    priority: 70,
  },
  {
    id: "footer-about",
    slot: "footer",
    type: "link",
    title: "Built by a tired dad with too many systems",
    body: "PareL started as CompareLion: a place to compare life without pretending everyone is optimized.",
    ctaLabel: "About PareL",
    ctaHref: "/about",
    active: true,
    priority: 50,
  },
];

function parseIsoMs(s: string | undefined): number | null {
  if (s == null || typeof s !== "string" || !s.trim()) return null;
  const t = Date.parse(s.trim());
  return Number.isFinite(t) ? t : null;
}

function isWithinSchedule(p: LandingPromo, nowMs: number): boolean {
  const start = parseIsoMs(p.startsAt);
  const end = parseIsoMs(p.endsAt);
  if (start !== null && nowMs < start) return false;
  if (end !== null && nowMs > end) return false;
  return true;
}

function isValidLandingPromo(p: unknown): p is LandingPromo {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  const lines = o.lines;
  const linesOk =
    lines === undefined ||
    (Array.isArray(lines) && lines.every((l) => typeof l === "string"));
  const bodyOk = o.body === undefined || typeof o.body === "string";
  const hrefOk =
    o.ctaHref === undefined || typeof o.ctaHref === "string";
  const imgOk =
    o.imageUrl === undefined || typeof o.imageUrl === "string";
  const browOk =
    o.eyebrow === undefined || typeof o.eyebrow === "string";
  const labelOk =
    o.ctaLabel === undefined || typeof o.ctaLabel === "string";
  return (
    typeof o.id === "string" &&
    o.id.length > 0 &&
    (o.slot === "hero-right" ||
      o.slot === "below-hero" ||
      o.slot === "footer") &&
    (o.type === "result" ||
      o.type === "announcement" ||
      o.type === "visual" ||
      o.type === "link") &&
    typeof o.title === "string" &&
    bodyOk &&
    linesOk &&
    hrefOk &&
    imgOk &&
    browOk &&
    labelOk &&
    typeof o.active === "boolean" &&
    typeof o.priority === "number" &&
    Number.isFinite(o.priority)
  );
}

export function getPromosForSlot(
  slot: LandingPromoSlot,
  limit?: number
): LandingPromo[] {
  try {
    const raw = LANDING_PROMOS;
    if (!Array.isArray(raw)) return [];

    const now = Date.now();
    let list = raw.filter(
      (p): p is LandingPromo =>
        isValidLandingPromo(p) && p.slot === slot && p.active
    );
    list = list.filter((p) => isWithinSchedule(p, now));
    list.sort((a, b) => b.priority - a.priority);
    const max =
      typeof limit === "number" && limit > 0
        ? Math.floor(limit)
        : list.length;
    return list.slice(0, max);
  } catch {
    return [];
  }
}

export function getPromoForSlot(slot: LandingPromoSlot): LandingPromo {
  try {
    const list = getPromosForSlot(slot, 1);
    if (list.length > 0 && list[0]) return list[0];
    return SLOT_FALLBACK[slot];
  } catch {
    return SLOT_FALLBACK[slot];
  }
}
