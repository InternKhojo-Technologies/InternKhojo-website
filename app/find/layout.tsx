import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Jobs & Startups — InternKhojo",
  description: "Discover internships, jobs, and startups on InternKhojo.",
  alternates: {
    canonical: "https://internkhojo.com/find",
  },
};

export default function FindLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
