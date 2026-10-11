import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { About } from "@/components/home/About";
import { TechStack } from "@/components/home/TechStack";
import { Services } from "@/components/home/Services";
import { Projects } from "@/components/home/Projects";
import { LatestPosts } from "@/components/home/LatestPosts";
import { Highlights } from "@/components/home/Highlights";
import { CTABanner } from "@/components/home/CTABanner";
import { ContactSection } from "@/components/home/ContactSection";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <About />
      <TechStack />
      <Services />
      <Projects />
      <LatestPosts />
      <Highlights />
      <CTABanner />
      <ContactSection />
    </>
  );
}
