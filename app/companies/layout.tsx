import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Companies Hiring Students in India",
  description:
    "Explore companies hiring interns and freshers on InternKhojo — search by name, filter by industry and size, and open verified roles.",
  alternates: {
    canonical: "https://internkhojo.com/companies",
  },
  openGraph: {
    title: "Browse Companies Hiring Students in India | InternKhojo",
    description:
      "Explore companies hiring interns and freshers on InternKhojo — search by name, filter by industry and size, and open verified roles.",
    url: "https://internkhojo.com/companies",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Companies Hiring Students in India | InternKhojo",
    description:
      "Explore companies hiring interns and freshers on InternKhojo — search by name, filter by industry and size, and open verified roles.",
  },
};

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
