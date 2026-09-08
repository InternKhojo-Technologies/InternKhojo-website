import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About Us — India's Internship Platform",
  description:
    "InternKhojo connects students with vetted internship opportunities across India. Free for students, curated by our team, backed by direct mentorship.",
  alternates: {
    canonical: "https://internkhojo.com/about",
  },
  openGraph: {
    title: "About Us | InternKhojo — India's Internship Platform",
    description:
      "InternKhojo connects students with vetted internship opportunities across India. Free for students, curated by our team, backed by direct mentorship.",
    url: "https://internkhojo.com/about",
    siteName: "InternKhojo",
    images: ["https://internkhojo.com/opengraph-image"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | InternKhojo — India's Internship Platform",
    description:
      "InternKhojo connects students with vetted internship opportunities across India. Free for students, curated by our team, backed by direct mentorship.",
    images: ["https://internkhojo.com/opengraph-image"],
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
