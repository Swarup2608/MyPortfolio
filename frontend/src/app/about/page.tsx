import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import {
  siteConfig,
  skills,
  experience,
  achievements,
  philosophy,
  services,
  process,
} from "@/lib/siteConfig";

export const metadata: Metadata = { title: "About" };

const accentColors = ["#B600A8", "#7621B0", "#BE4C00", "#B600A8"];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-300 px-[clamp(20px,3vw,40px)] pb-[clamp(70px,9vw,130px)] pt-[clamp(46px,6vw,80px)]">
      <div className="mb-[clamp(50px,7vw,100px)] grid items-center gap-[clamp(26px,4vw,60px)] grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        <div>
          <div className="mb-4 text-[.78rem] font-medium uppercase tracking-[.2em] text-accent">
            Profile
          </div>
          <h1 className="gradient-text text-[clamp(2.8rem,8vw,110px)] font-black uppercase leading-[0.9] tracking-[-.03em]">
            {siteConfig.name}
          </h1>
          <p className="mt-5.5 max-w-130 text-[clamp(.95rem,1.5vw,1.2rem)] font-light leading-[1.75] text-foreground/70">
            {siteConfig.bio}
          </p>
        </div>
        {/* Placeholder in place of a portrait photo — swap in your own image at
            frontend/public and reference it here whenever you have one. */}
        <div
          className="aspect-square w-full max-w-105 justify-self-center rounded-4xl"
          style={{ background: "linear-gradient(160deg, #B600A8 0%, #18011F 55%, #BE4C00 100%)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Home.png"
            alt=""
            className="h-full w-full rounded-4xl object-cover"
          />
        </div>
      </div>

      <div className="mb-[clamp(50px,7vw,100px)]">
        <div className="mb-4 text-[.78rem] font-medium uppercase tracking-[.2em] text-accent">
          About Me
        </div>
        <h2 className="text-[clamp(1.6rem,3.4vw,2.8rem)] font-black uppercase leading-none tracking-[-.02em] text-foreground">
          {siteConfig.tagline}
        </h2>
        <p className="mt-5 max-w-180 text-[clamp(.95rem,1.5vw,1.2rem)] font-light leading-[1.75] text-foreground/70">
          {siteConfig.about}
        </p>
      </div>

      <div className="mb-[clamp(50px,7vw,100px)]">
        <div className="mb-4 text-[.78rem] font-medium uppercase tracking-[.2em] text-accent">
          What I Do
        </div>
        <h2 className="text-[clamp(1.6rem,3.4vw,2.8rem)] font-black uppercase leading-none tracking-[-.02em] text-foreground">
          My Services
        </h2>
        <div className="mt-8 grid gap-[clamp(12px,1.6vw,20px)] grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
          {services.map((s) => (
            <div
              key={s.num}
              className="rounded-[26px] border border-foreground/14 bg-surface p-[clamp(20px,2.4vw,28px)]"
            >
              <div className="mb-3 text-[.75rem] font-medium tracking-[.14em] text-accent">
                {s.num}
              </div>
              <div className="text-[1.05rem] font-semibold leading-snug text-foreground">
                {s.name}
              </div>
              <p className="mt-2 text-[.9rem] font-light leading-[1.6] text-foreground/55">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-[clamp(50px,7vw,100px)]">
        <div className="mb-4 text-[.78rem] font-medium uppercase tracking-[.2em] text-accent">
          My Approach
        </div>
        <h2 className="text-[clamp(1.6rem,3.4vw,2.8rem)] font-black uppercase leading-none tracking-[-.02em] text-foreground">
          How I Work
        </h2>
        <div className="mt-10 grid gap-x-6 gap-y-10 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {process.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-foreground/20 text-sm font-bold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </div>
                {i < process.length - 1 && (
                  <div className="hidden h-px flex-1 bg-foreground/15 md:block" />
                )}
              </div>
              <div className="mt-4 text-[1.05rem] font-semibold text-foreground">
                {step.title}
              </div>
              <p className="mt-2 text-[.9rem] font-light leading-[1.6] text-foreground/55">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-[clamp(50px,7vw,100px)] grid items-center gap-[clamp(26px,4vw,60px)] grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        <div
          className="aspect-square w-full max-w-105 rounded-4xl"
          style={{ background: "linear-gradient(160deg, #B600A8 0%, #18011F 55%, #BE4C00 100%)" }}
        />
        <div>
          <div className="mb-4 text-[.78rem] font-medium uppercase tracking-[.2em] text-accent">
            My Goals
          </div>
          <h2 className="text-[clamp(1.6rem,3.4vw,2.8rem)] font-black uppercase leading-none tracking-[-.02em] text-foreground">
            What I Aim For
          </h2>
          <p className="mt-5 text-[clamp(.95rem,1.5vw,1.2rem)] font-light leading-[1.75] text-foreground/70">
            {siteConfig.goals}
          </p>
        </div>
      </div>

      <div className="border-t border-foreground/12 py-[clamp(30px,4vw,54px)]">
        <h2 className="mb-7.5 text-[clamp(1.6rem,3.4vw,2.8rem)] font-black uppercase text-foreground">
          Experience &amp; Education
        </h2>
        <div className="grid gap-[clamp(20px,3vw,50px)] md:grid-cols-2">
          <div>
            <div className="mb-5 text-[.78rem] font-medium uppercase tracking-[.2em] text-accent">
              Experience
            </div>
            <div className="relative h-105 overflow-y-auto pr-4">
              <div className="absolute top-0 bottom-0 left-[5px] w-px bg-foreground/12" />
              <div className="flex flex-col gap-8">
                {experience.map((e, i) => (
                  <Reveal key={e.role} delay={i * 0.05}>
                    <div className="relative pl-6">
                      <div className="absolute top-1.5 left-0 h-2.5 w-2.5 rounded-full border-2 border-accent bg-background" />
                      <div className="text-[.78rem] font-light uppercase tracking-wide text-foreground/45">
                        {e.range}
                      </div>
                      <div className="mt-1 text-[1.05rem] font-semibold text-foreground">
                        {e.role}
                      </div>
                      <div className="mt-1.5 text-[.9rem] font-light leading-[1.6] text-foreground/55">
                        {e.org} — {e.desc}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-5 text-[.78rem] font-medium uppercase tracking-[.2em] text-accent">
              Education &amp; Achievements
            </div>
            <div className="relative h-105 overflow-y-auto pr-4">
              <div className="absolute top-0 bottom-0 left-[5px] w-px bg-foreground/12" />
              <div className="flex flex-col gap-8">
                {achievements.map((a, i) => (
                  <Reveal key={a.title} delay={i * 0.05}>
                    <div className="relative pl-6">
                      <div className="absolute top-1.5 left-0 h-2.5 w-2.5 rounded-full border-2 border-accent bg-background" />
                      <div className="text-[.78rem] font-light uppercase tracking-wide text-foreground/45">
                        {a.year}
                      </div>
                      <div className="mt-1 text-[1.05rem] font-semibold text-foreground">
                        {a.title}
                      </div>
                      <div className="mt-1.5 text-[.9rem] font-light leading-[1.6] text-foreground/55">
                        {a.org}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-foreground/12 py-[clamp(30px,4vw,54px)]">
        <h2 className="mb-7.5 text-[clamp(1.6rem,3.4vw,2.8rem)] font-black uppercase text-foreground">
          Skills &amp; Technologies
        </h2>
        <div className="grid gap-[clamp(12px,1.6vw,20px)] grid-cols-[repeat(auto-fit,minmax(230px,1fr))]">
          {skills.map((group, i) => (
            <div
              key={group.category}
              className="rounded-[26px] border border-foreground/14 bg-surface p-[clamp(20px,2.4vw,30px)]"
            >
              <div
                className="mb-4 text-sm font-bold uppercase tracking-wide"
                style={{ color: accentColors[i % accentColors.length] }}
              >
                {group.category}
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-foreground/16 px-3.5 py-1.5 text-[.85rem] font-light text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-foreground/12 pt-[clamp(40px,6vw,80px)] text-center">
        <div className="mb-5 text-[.78rem] font-medium uppercase tracking-[.2em] text-accent">
          Personal philosophy
        </div>
        <p className="mx-auto max-w-205 text-[clamp(1.2rem,3vw,2.2rem)] font-light leading-snug text-foreground">
          &ldquo;{philosophy}&rdquo;
        </p>
        <Link
          href="/#contact"
          className="gradient-cta mt-10 inline-flex items-center justify-center rounded-full px-[clamp(32px,3.4vw,48px)] py-[clamp(12px,1.4vw,16px)] text-[clamp(.75rem,1.1vw,1rem)] font-medium uppercase tracking-widest text-white"
        >
          Contact Me
        </Link>
      </div>
    </div>
  );
}
