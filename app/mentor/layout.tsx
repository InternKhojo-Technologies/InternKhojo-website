import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentor Network Waitlist",
  description:
    "Join the InternKhojo mentor network waitlist — get guidance from tech leads, product managers and industry experts as a mentee, or apply as a mentor.",
  alternates: {
    canonical: "https://internkhojo.com/mentor",
  },
  openGraph: {
    title: "Mentor Network Waitlist | InternKhojo",
    description:
      "Join the InternKhojo mentor network waitlist — get guidance from tech leads, product managers and industry experts as a mentee, or apply as a mentor.",
    url: "https://internkhojo.com/mentor",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mentor Network Waitlist | InternKhojo",
    description:
      "Join the InternKhojo mentor network waitlist — get guidance from tech leads, product managers and industry experts as a mentee, or apply as a mentor.",
  },
};

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
