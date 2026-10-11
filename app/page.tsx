import type { Metadata } from "next";
import Hero from "@/components/Hero";
import IntroSection from "@/components/IntroSection";
import Stats from "@/components/Stats";
import HowToUse from "@/components/HowToUse";
import Reviews from "@/components/Reviews";
import CTA from "@/components/CTA";

export const metadata: Metadata = {
  title: "Internships, Fresher Jobs & Startups Hiring in India",
  description:
    "Find vetted internships, fresher jobs and startup opportunities across India on InternKhojo. Free for students — plus placement practice tests and an external opportunities bulletin.",
  alternates: {
    canonical: "https://internkhojo.com/",
  },
  openGraph: {
    title: "Internships, Fresher Jobs & Startups Hiring in India | InternKhojo",
    description:
      "Find vetted internships, fresher jobs and startup opportunities across India on InternKhojo. Free for students — plus placement practice tests and an external opportunities bulletin.",
    url: "https://internkhojo.com/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Internships, Fresher Jobs & Startups Hiring in India | InternKhojo",
    description:
      "Find vetted internships, fresher jobs and startup opportunities across India on InternKhojo. Free for students — plus placement practice tests and an external opportunities bulletin.",
  },
};

export default function Home() {
  return (
    <div className="bg-white">
      <Hero />

      <IntroSection />

      <Stats />

      <HowToUse />

      <Reviews />

      <CTA />
    </div>
  );
}
