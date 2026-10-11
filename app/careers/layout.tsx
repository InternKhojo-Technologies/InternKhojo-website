import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers at InternKhojo — Open Roles",
  description:
    "See open internships and full-time roles at InternKhojo and apply directly — join the team building early-career hiring in India.",
  alternates: {
    canonical: "https://internkhojo.com/careers",
  },
  openGraph: {
    title: "Careers at InternKhojo — Open Roles | InternKhojo",
    description:
      "See open internships and full-time roles at InternKhojo and apply directly — join the team building early-career hiring in India.",
    url: "https://internkhojo.com/careers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers at InternKhojo — Open Roles | InternKhojo",
    description:
      "See open internships and full-time roles at InternKhojo and apply directly — join the team building early-career hiring in India.",
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
