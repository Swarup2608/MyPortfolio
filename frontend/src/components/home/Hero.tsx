"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/siteConfig";

const PORTRAIT_URL =
  "/Home.png";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const y = useSpring(mouseY, { stiffness: 150, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(relX * 24);
    mouseY.set(relY * 24);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-[calc(100vh-64px)] flex-col overflow-hidden sm:min-h-[calc(100vh-76px)]"
    >
      <div className="relative z-20 mt-6 overflow-hidden sm:mt-10">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          className="gradient-text w-full whitespace-nowrap text-center text-[15vw] font-black uppercase leading-[0.85] tracking-tighter sm:text-[13vw]"
        >
          Hi, I&apos;m {siteConfig.name.split(" ")[0]}
        </motion.h1>
      </div>

      <motion.div
        style={{ x, y }}
        className="pointer-events-none absolute bottom-0 left-1/2 z-10 w-[clamp(280px,38vw,520px)] -translate-x-1/2"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PORTRAIT_URL} alt="" className="block w-full" />
        </motion.div>
      </motion.div>

      <Container className="relative z-20 mt-auto flex flex-col items-start justify-between gap-6 pb-10 sm:flex-row sm:items-end sm:pb-14">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-xs text-sm font-light uppercase leading-relaxed tracking-wide text-foreground sm:max-w-sm sm:text-lg"
        >
          {siteConfig.tagline}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-none flex-wrap gap-3"
        >
          <a
            href="#contact"
            className="gradient-cta inline-flex items-center justify-center rounded-full px-10 py-4 text-sm font-medium uppercase tracking-widest text-white"
          >
            Contact Me
          </a>
          {siteConfig.resumeUrl && (
            <a
              href={siteConfig.resumeUrl}
              download
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground/60 bg-background/40 px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-foreground backdrop-blur-sm transition-colors hover:bg-foreground/10"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" />
              </svg>
              Resume
            </a>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
