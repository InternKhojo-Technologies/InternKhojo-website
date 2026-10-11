import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { HIRE_CATEGORIES } from "@/lib/hire-categories";
import { SITE_URL } from "@/lib/site";

// Professional grotesque for arena headings — Inter Tight-style stack via
// Inter with tight tracking applied in components. Self-hosted by next/font.
const hireDisplay = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-hire-display",
});

const TITLE = "Daily Practice Tests — InternKhojo Hire";
const DESCRIPTION =
  "One short test per topic every day. Everyone gets the same 10 questions, answers are checked automatically, scores go on the live leaderboard, and full solutions open up after you submit.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/hire`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Static WebPage + ItemList entity graph for the arena. Question content
// itself is auth-gated, so only track-level entities are exposed.
const HIRE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/hire#webpage`,
      url: `${SITE_URL}/hire`,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en-IN",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/hire#tracks`,
      name: "Daily practice test topics",
      itemListElement: HIRE_CATEGORIES.map((cat, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: cat.title,
        description: cat.desc,
        url: `${SITE_URL}/hire/${cat.slug}/daily`,
      })),
    },
  ],
};

export default function HireLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={hireDisplay.variable}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HIRE_JSON_LD) }}
      />
      {children}
    </div>
  );
}
