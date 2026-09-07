import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Jobs & Internships — InternKhojo",
  description:
    "Browse open jobs and internships from companies hiring on InternKhojo.",
  alternates: {
    canonical: "https://internkhojo.com/find/jobs",
  },
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
