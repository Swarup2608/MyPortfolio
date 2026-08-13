"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { WordReveal } from "@/components/motion/WordReveal";
import { siteConfig } from "@/lib/siteConfig";

// Decorative 3D-render icons carried over from the reference design (same
// asset URLs) purely for visual fidelity — swap for your own art whenever.
const icons = [
  {
    src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png",
    className: "left-[3%] top-[4%] w-[clamp(110px,16vw,210px)]",
    fromX: -80,
    delay: 0.1,
  },
  {
    src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png",
    className: "right-[3%] top-[4%] w-[clamp(110px,16vw,210px)]",
    fromX: 80,
    delay: 0.15,
  },
  {
    src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png",
    className: "bottom-[8%] left-[6%] w-[clamp(95px,13vw,180px)]",
    fromX: -80,
    delay: 0.25,
  },
  {
    src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png",
    className: "bottom-[8%] right-[6%] w-[clamp(120px,16vw,220px)]",
    fromX: 80,
    delay: 0.3,
  },
];

export function About() {
  return (
    <section
      id="about"
      className="relative flex min-h-screen scroll-mt-16 flex-col items-center justify-center gap-[clamp(40px,6vw,64px)] overflow-hidden bg-background px-[clamp(20px,3vw,40px)] py-[clamp(60px,8vw,80px)]"
    >
      {icons.map((icon) => (
        <motion.img
          key={icon.src}
          src={icon.src}
          alt=""
          initial={{ opacity: 0, x: icon.fromX }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, delay: icon.delay, ease: [0.25, 0.1, 0.25, 1] }}
          className={`absolute ${icon.className}`}
        />
      ))}

      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="gradient-text relative z-2 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-[0.9] tracking-tighter"
      >
        About me
      </motion.h2>

      <WordReveal
        text={siteConfig.bio}
        className="relative z-2 max-w-[560px] text-[clamp(1rem,2vw,1.35rem)] font-medium leading-[1.65] text-foreground"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-2"
      >
        <Link
          href="/about"
          className="gradient-cta inline-flex items-center justify-center rounded-full px-[clamp(32px,3.4vw,48px)] py-[clamp(12px,1.4vw,16px)] text-[clamp(.75rem,1.1vw,1rem)] font-medium uppercase tracking-widest text-white"
        >
          More about me
        </Link>
      </motion.div>
    </section>
  );
}
