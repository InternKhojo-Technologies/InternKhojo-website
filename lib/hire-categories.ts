export type HireCategorySlug =
  | "aptitude"
  | "technical"
  | "reasoning"
  | "verbal"
  | "coding"
  | "general";

export interface HireCategory {
  slug: string;
  title: string;
  short: string;
  desc: string;
  scope: string;
  estTime: string;
  collection: string;
  /**
   * Optional `category_label` filter inside the collection. The
   * aptitude_questions bank holds Quant + Logical + Verbal docs mixed
   * together, so the three tracks share that collection and each reads
   * only its own labelled slice.
   */
  labelFilter?: string;
}

/**
 * Questions served per daily test. Every playable track must hold at least
 * this many documents — tracks below the threshold are reported as
 * unavailable by GET /api/hire/tracks and gated in the UI.
 */
export const HIRE_QUESTIONS_PER_TEST = 10;

export const HIRE_CATEGORIES: HireCategory[] = [
  {
    slug: "aptitude",
    title: "Quantitative Aptitude",
    short: "Aptitude",
    desc: "Numbers, percentages and quick mental maths — the classic placement starter.",
    scope: "General Screening",
    estTime: "15 Mins",
    collection: "aptitude_questions",
    labelFilter: "Quantitative Aptitude",
  },
  {
    slug: "technical",
    title: "Technical MCQ",
    short: "Technical",
    desc: "Computer basics: operating systems, databases, networks and OOP.",
    scope: "Core Engineering",
    estTime: "20 Mins",
    collection: "technical_mcqs",
  },
  {
    slug: "reasoning",
    title: "Logical Reasoning",
    short: "Reasoning",
    desc: "Puzzles, patterns and logical thinking questions.",
    scope: "Brain Teasers",
    estTime: "20 Mins",
    collection: "aptitude_questions",
    labelFilter: "Logical Reasoning",
  },
  {
    slug: "verbal",
    title: "Verbal Ability",
    short: "Verbal",
    desc: "English: grammar, vocabulary and short reading passages.",
    scope: "Communication",
    estTime: "15 Mins",
    collection: "aptitude_questions",
    labelFilter: "Verbal Ability",
  },
  {
    slug: "coding",
    title: "Coding Logic (DSA)",
    short: "Coding",
    desc: "Arrays, strings and basic problem solving with code logic.",
    scope: "DSA & Logic",
    estTime: "30 Mins",
    collection: "dsa_questions",
  },
  {
    slug: "general",
    title: "General Awareness",
    short: "General",
    desc: "Everyday knowledge: business, tech news and current affairs.",
    scope: "Awareness",
    estTime: "10 Mins",
    collection: "general_questions",
  },
];

/** Normalize a `[type]` route param to a safe slug. Returns null when invalid. */
export function normalizeCategory(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const slug = input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug || slug.length > 48) return null;
  return slug;
}

/** Map a category slug to its MongoDB collection name. */
export function categoryToCollection(slug: string): string {
  const known = HIRE_CATEGORIES.find((c) => c.slug === slug);
  if (known) return known.collection;
  const safe = slug.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `${safe || "general"}_questions`;
}

/**
 * MongoDB filter scoping a category to its slice of a shared collection.
 * Returns {} when the category owns its whole collection.
 * Review hydration (attempt/submit) intentionally ignores this so older
 * submissions always resolve, even if bank labelling changes later.
 */
export function categoryMongoFilter(slug: string): Record<string, unknown> {
  const known = HIRE_CATEGORIES.find((c) => c.slug === slug);
  if (known?.labelFilter) return { category_label: known.labelFilter };
  return {};
}

/** Metadata lookup with graceful fallback for custom slugs. */
export function getCategoryMeta(slug: string): HireCategory {
  const known = HIRE_CATEGORIES.find((c) => c.slug === slug);
  if (known) return known;
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    slug,
    title,
    short: title,
    desc: `Daily timed challenge track for ${title}.`,
    scope: "Custom Track",
    estTime: "15 Mins",
    collection: categoryToCollection(slug),
  };
}

export function isKnownCategory(slug: string): boolean {
  return HIRE_CATEGORIES.some((c) => c.slug === slug);
}

export interface HireSection {
  title: string;
  desc: string;
  slugs: string[];
}

/**
 * How topics are grouped on screen. The tests themselves stay separate
 * (own question bank, own daily set, own leaderboard) — sections are only
 * a display grouping so related topics sit together.
 */
export const HIRE_SECTIONS: HireSection[] = [
  {
    title: "Aptitude",
    desc: "Maths, logic and English — the classic placement trio.",
    slugs: ["aptitude", "reasoning", "verbal"],
  },
  {
    title: "Computer Science",
    desc: "Core CS subjects and coding logic.",
    slugs: ["technical", "coding"],
  },
  {
    title: "General Awareness",
    desc: "Business, tech and everyday awareness.",
    slugs: ["general"],
  },
];

/**
 * Precise leaderboard / filter label per track. The shared aptitude bank
 * holds Quant + Logical + Verbal docs, but each track only serves its own
 * labelled slice — so "Quant" reads exactly what that filter shows.
 */
export function boardLabel(slug: string): string {
  const map: Record<string, string> = {
    aptitude: "Quant",
    reasoning: "Logical",
    verbal: "Verbal",
    technical: "Technical",
    coding: "Coding",
    general: "General",
  };
  return map[slug] ?? slug;
}
