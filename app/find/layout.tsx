import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Jobs & Startups — InternKhojo",
  description:
    "Discover internships, jobs, and startups on InternKhojo — browse recent verified openings and companies hiring across India.",
  alternates: {
    canonical: "https://internkhojo.com/find",
  },
  openGraph: {
    title: "Find Jobs & Startups — InternKhojo",
    description:
      "Discover internships, jobs, and startups on InternKhojo — browse recent verified openings and companies hiring across India.",
    url: "https://internkhojo.com/find",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Jobs & Startups — InternKhojo",
    description:
      "Discover internships, jobs, and startups on InternKhojo — browse recent verified openings and companies hiring across India.",
  },
};

export default function FindLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
