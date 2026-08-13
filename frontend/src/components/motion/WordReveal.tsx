"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

function Word({
  text,
  progress,
  range,
}: {
  text: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity }}>{text}</motion.span>;
}

// Reproduces the design's scroll-scrubbed word-by-word text reveal: each word
// starts dim and brightens in sequence as the section scrolls through view.
export function WordReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className={cn("flex flex-wrap justify-center gap-x-[0.28em] gap-y-0", className)}
    >
      {words.map((word, i) => (
        <Word
          key={i}
          text={word}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
        />
      ))}
    </p>
  );
}
