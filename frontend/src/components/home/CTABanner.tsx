import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";

export function CTABanner() {
  return (
    <section className="border-t border-foreground/9 bg-background px-[clamp(20px,3vw,40px)] py-[clamp(70px,10vw,140px)] text-center">
      <Reveal y={34}>
        <h2 className="gradient-text mx-auto max-w-[1000px] text-[clamp(2.4rem,9vw,120px)] font-black uppercase leading-[0.92] tracking-[-.03em]">
          Let&apos;s make something unforgettable
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <Link
          href="#contact"
          className="gradient-cta mt-[clamp(26px,3.5vw,44px)] inline-flex items-center justify-center rounded-full px-[clamp(32px,3.4vw,48px)] py-[clamp(12px,1.4vw,16px)] text-[clamp(.75rem,1.1vw,1rem)] font-medium uppercase tracking-widest text-white"
        >
          Contact Me
        </Link>
      </Reveal>
    </section>
  );
}
