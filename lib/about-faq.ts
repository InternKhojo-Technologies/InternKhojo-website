// Shared About-page FAQ — single source of truth so the visible
// server-rendered FAQ and the FAQPage JSON-LD can never drift apart.
// Copy is taken verbatim from the existing About page FAQ.

export interface AboutFaq {
  question: string;
  answer: string;
}

export const ABOUT_FAQ: AboutFaq[] = [
  {
    question: "What is InternKhojo?",
    answer:
      "InternKhojo is a next-generation talent platform that connects ambitious students and early-career professionals with curated internship opportunities across India and beyond. We vet every listing to ensure quality and relevance.",
  },
  {
    question: "How do I apply for an internship?",
    answer:
      "Simply create your profile, browse the available openings on our platform, and hit apply. Your application goes directly to the hiring team—no black holes, no ghosting. You'll receive status updates at every stage.",
  },
  {
    question: "Is InternKhojo free for students?",
    answer:
      "Yes, InternKhojo is completely free for students and job seekers. We believe access to opportunity should never have a paywall. Our revenue model is built around partnerships with companies, not candidates.",
  },
  {
    question: "How are internships vetted?",
    answer:
      "Every internship posted on InternKhojo goes through a manual curation process. We verify company legitimacy, role expectations, stipend transparency, and mentorship quality before any listing goes live.",
  },
  {
    question: "Can companies post internships on InternKhojo?",
    answer:
      "Absolutely. Companies and startups can onboard through our employer portal, create detailed role listings, and access our pool of pre-qualified, motivated candidates. We make hiring early talent effortless.",
  },
  {
    question: "What makes InternKhojo different from other job boards?",
    answer:
      "We're not a job board—we're a career launchpad. Every role is handpicked, every application gets a response, and we offer direct mentorship from industry leaders. No spam, no noise, just signal.",
  },
];

export function aboutFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ABOUT_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
