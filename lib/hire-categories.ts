export type HireCategorySlug =
  | "aptitude"
  | "technical"
  | "reasoning"
  | "verbal"
  | "swe"
  | "aiml"
  | "cloud"
  | "webdev"
  | "cpp"
  | "java"
  | "cybersecurity"
  | "python"
  | "system-design"
  | "dsa";

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
  /**
   * Optional `tech_subject` filter inside the collection. The
   * technical_mcqs bank holds every CS subject mixed together, so each
   * technical track reads only its own subject slice via
   * `{ tech_subject: { $in: subjectFilter } }`.
   */
  subjectFilter?: string[];
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
    desc: "Core CS: operating systems, databases, networks and OOP.",
    scope: "Core Engineering",
    estTime: "20 Mins",
    collection: "technical_mcqs",
    subjectFilter: [
      "Operating Systems",
      "Database Management Systems",
      "Computer Networks",
      "Object Oriented Programming",
    ],
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
    slug: "swe",
    title: "SWE / SDE",
    short: "SWE/SDE",
    desc: "Software engineering: SDLC, Agile, testing and development practices.",
    scope: "Engineering Roles",
    estTime: "20 Mins",
    collection: "technical_mcqs",
    subjectFilter: ["Software Engineering"],
  },
  {
    slug: "aiml",
    title: "AI / ML",
    short: "AI/ML",
    desc: "Artificial intelligence and machine learning concepts.",
    scope: "Core Engineering",
    estTime: "20 Mins",
    collection: "technical_mcqs",
    subjectFilter: ["Artificial Intelligence & Machine Learning"],
  },
  {
    slug: "cloud",
    title: "Cloud Computing",
    short: "Cloud",
    desc: "Cloud concepts: services, deployment models and platforms.",
    scope: "Core Engineering",
    estTime: "20 Mins",
    collection: "technical_mcqs",
    subjectFilter: ["Cloud Computing"],
  },
  {
    slug: "webdev",
    title: "Web Development",
    short: "Web Dev",
    desc: "Web basics: HTML, CSS and JavaScript.",
    scope: "Development",
    estTime: "20 Mins",
    collection: "technical_mcqs",
    subjectFilter: ["Web Development (HTML/CSS/JS)"],
  },
  {
    slug: "cpp",
    title: "C / C++ Programming",
    short: "C/C++",
    desc: "C and C++ programming: syntax, pointers, OOP and problem logic.",
    scope: "Programming",
    estTime: "20 Mins",
    collection: "technical_mcqs",
    subjectFilter: ["C Programming", "C++ Programming"],
  },
  {
    slug: "java",
    title: "Java Programming",
    short: "Java",
    desc: "Java programming: OOP, collections, exceptions and JVM basics.",
    scope: "Programming",
    estTime: "20 Mins",
    collection: "technical_mcqs",
    subjectFilter: ["Java Programming"],
  },
  {
    slug: "cybersecurity",
    title: "Cyber Security",
    short: "Security",
    desc: "Security basics: threats, cryptography and safe practices.",
    scope: "Core Engineering",
    estTime: "20 Mins",
    collection: "technical_mcqs",
    subjectFilter: ["Cyber Security"],
  },
  {
    slug: "python",
    title: "Python Programming",
    short: "Python",
    desc: "Python programming: syntax, data structures and OOP.",
    scope: "Programming",
    estTime: "20 Mins",
    collection: "technical_mcqs",
    subjectFilter: ["Python Programming"],
  },
  {
    slug: "system-design",
    title: "System Design",
    short: "System Design",
    desc: "System design: scalability, databases, caching and architecture.",
    scope: "Engineering Roles",
    estTime: "20 Mins",
    collection: "technical_mcqs",
    subjectFilter: ["System Design"],
  },
  {
    slug: "dsa",
    title: "DSA Practice",
    short: "DSA",
    desc: "Mixed DSA MCQs: outputs, errors, complexity and theory across Arrays, Trees, Graphs and more.",
    scope: "Data Structures",
    estTime: "15 Mins",
    // Owns the whole dsa_questions bank (Master_Question_Bank) — the daily
    // set is a deterministic mixed slice, like every other leaderboard track.
    collection: "dsa_questions",
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
 * - `labelFilter`  -> { category_label: ... } (aptitude bank)
 * - `subjectFilter` -> { tech_subject: { $in: [...] } } (technical bank)
 * Review hydration (attempt/submit) intentionally ignores this so older
 * submissions always resolve, even if bank labelling changes later.
 */
export function categoryMongoFilter(slug: string): Record<string, unknown> {
  const known = HIRE_CATEGORIES.find((c) => c.slug === slug);
  if (!known) return {};
  const filter: Record<string, unknown> = {};
  if (known.labelFilter) filter.category_label = known.labelFilter;
  if (known.subjectFilter && known.subjectFilter.length > 0) {
    filter.tech_subject = { $in: known.subjectFilter };
  }
  return filter;
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
    title: "Data Structures & Algorithms",
    desc: "Mixed DSA MCQs every day, plus a custom practice mode.",
    slugs: ["dsa"],
  },
  {
    title: "Computer Science",
    desc: "Core CS subjects, engineering roles and programming languages.",
    slugs: [
      "technical",
      "swe",
      "aiml",
      "cloud",
      "webdev",
      "cpp",
      "java",
      "cybersecurity",
      "python",
      "system-design",
    ],
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
    swe: "SWE/SDE",
    aiml: "AI/ML",
    cloud: "Cloud",
    webdev: "Web Dev",
    cpp: "C/C++",
    java: "Java",
    cybersecurity: "Security",
    python: "Python",
    "system-design": "System Design",
    dsa: "DSA",
    // Legacy tracks (removed from the UI but kept readable in history).
    coding: "Coding",
    general: "General",
  };
  return map[slug] ?? slug;
}
