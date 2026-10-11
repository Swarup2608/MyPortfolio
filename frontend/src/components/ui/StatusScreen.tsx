"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Seeded so the star field is the same on every render (Math.random during render is impure).
function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = seededRandom(403);
const STARS = Array.from({ length: 80 }, () => ({
  left: rand() * 100,
  top: rand() * 100,
  size: 1 + rand() * 1.8,
  opacity: 0.2 + rand() * 0.6,
  twinkle: rand() < 0.35,
  delay: rand() * 6,
  duration: 3 + rand() * 4,
}));

// Orbits sit in a 1000×440 viewBox centred on the number and tilted -14°;
// ry ≈ 0.3·rx reads as a ring seen from slightly above.
const ORBITS = [
  { rx: 300, ry: 90, r: 9, dur: 14, begin: -3, fill: "fill-accent", dashed: false },
  { rx: 400, ry: 120, r: 12, dur: 24, begin: -15, fill: "fill-accent-3", dashed: false },
  { rx: 490, ry: 147, r: 7, dur: 38, begin: -26, fill: "fill-accent-2", dashed: true },
];

function ellipsePath(rx: number, ry: number) {
  return `M ${rx} 0 A ${rx} ${ry} 0 1 1 ${-rx} 0 A ${rx} ${ry} 0 1 1 ${rx} 0`;
}

// Drawn twice: the full orbits behind the number, then only their near half (y > 0 in the
// tilted frame) in front of it, so rings and planets pass in front of and behind the code.
function Orbits({ front = false, svgRef }: { front?: boolean; svgRef: React.Ref<SVGSVGElement> }) {
  const clipId = useId();

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1000 440"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-1/2 left-1/2 aspect-[1000/440] w-[175%] -translate-x-1/2 -translate-y-1/2 text-foreground",
        front ? "z-20" : "z-0"
      )}
    >
      {front && (
        <defs>
          <clipPath id={clipId}>
            <rect x="-520" y="0" width="1040" height="200" />
          </clipPath>
        </defs>
      )}
      <g transform="translate(500 220) rotate(-14)">
        <g clipPath={front ? `url(#${clipId})` : undefined} opacity={front ? 1 : 0.5}>
          {ORBITS.map((orbit) => (
            <g key={orbit.rx}>
              <ellipse
                rx={orbit.rx}
                ry={orbit.ry}
                fill="none"
                stroke="currentColor"
                strokeOpacity={front ? 0.35 : 0.25}
                strokeWidth={1.25}
                strokeDasharray={orbit.dashed ? "3 9" : undefined}
                vectorEffect="non-scaling-stroke"
              />
              <g className={orbit.fill}>
                <circle r={orbit.r * 2.6} opacity={0.18} />
                <circle r={orbit.r} />
                <animateMotion
                  dur={`${orbit.dur}s`}
                  begin={`${orbit.begin}s`}
                  repeatCount="indefinite"
                  path={ellipsePath(orbit.rx, orbit.ry)}
                />
              </g>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

// Full-panel error state (403, 404, …): a big orbiting status code, a label, a short
// explanation and one way out. className sets the panel's height for where it's used.
export function StatusScreen({
  code,
  title,
  message,
  href,
  linkLabel,
  className,
}: {
  code: string;
  title: string;
  message: React.ReactNode;
  href: string;
  linkLabel: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const backRef = useRef<SVGSVGElement>(null);
  const frontRef = useRef<SVGSVGElement>(null);

  // Each inline <svg> runs its own SMIL clock. Restart both together so the front and
  // back copies of each planet stay locked; freeze them in place for reduced motion.
  useEffect(() => {
    for (const svg of [backRef.current, frontRef.current]) {
      if (!svg) continue;
      svg.setCurrentTime(0);
      if (reduceMotion) svg.pauseAnimations();
      else svg.unpauseAnimations();
    }
  }, [reduceMotion]);

  return (
    <section
      className={cn(
        "relative isolate flex flex-col overflow-hidden rounded-[26px] border border-foreground/10 bg-[radial-gradient(ellipse_at_50%_40%,var(--surface-muted),var(--background)_70%)]",
        className
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {STARS.map((star, i) => (
          <span
            key={i}
            className={cn("absolute rounded-full bg-foreground", star.twinkle && "animate-twinkle")}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 grid flex-1 place-items-center px-4 py-12">
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 h-[130%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--accent), transparent)" }}
          />
          <Orbits svgRef={backRef} />
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="gradient-text relative z-10 text-[clamp(6rem,22vw,18rem)] font-black leading-[0.85] tracking-tighter"
          >
            <span className="sr-only">Error </span>
            {code}
          </motion.h1>
          <Orbits front svgRef={frontRef} />
        </div>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 flex flex-col items-center gap-4 px-6 pb-10 text-center sm:pb-14"
      >
        <p className="pl-[.4em] text-[clamp(1rem,2.2vw,1.5rem)] font-semibold uppercase tracking-[.4em] text-foreground">
          {title}
        </p>
        <p className="max-w-md text-sm font-light leading-relaxed text-foreground/55">{message}</p>
        <Link
          href={href}
          className="gradient-cta mt-2 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-xs font-medium uppercase tracking-widest text-white"
        >
          {linkLabel}
        </Link>
      </motion.div>
    </section>
  );
}
