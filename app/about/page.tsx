import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About Us | InternKhojo — India's Internship Platform",
  description:
    "InternKhojo connects students with vetted internship opportunities across India. Free for students, curated by our team, backed by direct mentorship.",
  alternates: {
    canonical: "https://www.internkhojo.com/about",
  },
  openGraph: {
    title: "About Us | InternKhojo — India's Internship Platform",
    description:
      "InternKhojo connects students with vetted internship opportunities across India. Free for students, curated by our team, backed by direct mentorship.",
    url: "https://www.internkhojo.com/about",
    siteName: "InternKhojo",
    images: ["https://www.internkhojo.com/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | InternKhojo — India's Internship Platform",
    description:
      "InternKhojo connects students with vetted internship opportunities across India. Free for students, curated by our team, backed by direct mentorship.",
    images: ["https://www.internkhojo.com/og-image.jpg"],
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
