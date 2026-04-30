import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import IntroSection from "@/components/IntroSection";
import Stats from "@/components/Stats";
import HowToUse from "@/components/HowToUse";
import Reviews from "@/components/Reviews";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

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
