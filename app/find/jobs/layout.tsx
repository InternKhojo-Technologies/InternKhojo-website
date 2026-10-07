import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Jobs & Internships — InternKhojo",
  description:
    "Browse open jobs and internships from companies hiring on InternKhojo — filter by title, location, company, pay and skills.",
  alternates: {
    canonical: "https://internkhojo.com/find/jobs",
  },
  openGraph: {
    title: "Find Jobs & Internships — InternKhojo",
    description:
      "Browse open jobs and internships from companies hiring on InternKhojo — filter by title, location, company, pay and skills.",
    url: "https://internkhojo.com/find/jobs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Jobs & Internships — InternKhojo",
    description:
      "Browse open jobs and internships from companies hiring on InternKhojo — filter by title, location, company, pay and skills.",
  },
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
