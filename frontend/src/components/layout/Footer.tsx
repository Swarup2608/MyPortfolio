"use client";

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { socialLinks } from "@/components/ui/SocialIcons";
import { siteConfig } from "@/lib/siteConfig";

const siteLinks = [
  { href: "/about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/blog", label: "Journal" },
  { href: "/#contact", label: "Contact" },
];

// Add `email: "you@example.com"` to siteConfig
const EMAIL = siteConfig.email;

export function Footer() {
  const pathname = usePathname();
  const firstName = siteConfig.name.split(" ")[0];

  return (
    <footer className="relative overflow-hidden border-t border-foreground/10">
      {/* soft accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
      />

      <Container className="relative max-w-6xl px-5 sm:px-10">
        {/* ── CTA band ─────────────────────────────── */}
        <section className="flex flex-col gap-8 border-b border-foreground/10 py-16 sm:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-accent">
              Got an idea?
            </p>
            <h2 className="text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Let&apos;s build it,{" "}
              <span className="bg-gradient-to-r from-accent to-fuchsia-400 bg-clip-text text-transparent">
                end to end.
              </span>
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/#contact"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-fuchsia-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_30px_-6px] shadow-accent/60 transition hover:shadow-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Start a project
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            {EMAIL && <CopyEmail email={EMAIL} />}
          </div>
        </section>

        {/* ── Main grid ────────────────────────────── */}
        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-block text-2xl font-black uppercase tracking-wide text-foreground"
            >
              {firstName}
              <span className="text-accent">.</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-foreground/55">
              {siteConfig.tagline}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:hidden" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Open to new opportunities
              </span>
              <LocalTime />
            </div>
          </div>

          <nav aria-label="Footer">
            <ColumnTitle>Site</ColumnTitle>
            <ul className="space-y-1">
              {siteLinks.map((link) => {
                const active =
                  !link.href.includes("#") && pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`group inline-flex items-center gap-2 rounded py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        active
                          ? "text-accent"
                          : "text-foreground/70 hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`h-px bg-accent transition-all ${
                          active ? "w-4" : "w-0 group-hover:w-4"
                        }`}
                      />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div>
            <ColumnTitle>Elsewhere</ColumnTitle>
            <ul className="space-y-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-foreground/10 bg-foreground/[.02] px-3.5 py-2.5 text-sm text-foreground/80 transition hover:border-accent/40 hover:bg-accent/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Icon className="h-4 w-4 text-foreground/60 transition-colors group-hover:text-accent" />
                    <span className="flex-1">{label}</span>
                    <ArrowIcon className="h-3.5 w-3.5 text-foreground/30 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────── */}
        <div className="flex flex-col-reverse items-start gap-4 border-t border-foreground/10 py-6 text-xs text-foreground/40 sm:flex-row sm:items-center sm:justify-between">
          <span>
            &copy; {new Date().getFullYear()} {siteConfig.name}. Designed &amp;
            built by me.
          </span>
          <div className="flex items-center gap-5">
            
            <BackToTop />
          </div>
        </div>
      </Container>

      {/* oversized wordmark */}
      <div
        aria-hidden
        className="mb-8 pointer-events-none select-none overflow-hidden"
      >
        <div className="-mb-[0.14em] bg-gradient-to-b from-foreground/[.8] to-foreground/[.1] bg-clip-text text-center text-[20vw] font-extrabold uppercase leading-none tracking-tight text-transparent sm:text-[16vw]">
          {firstName}
        </div>
      </div>
    </footer>
  );
}

/* ── Pieces ─────────────────────────────────────── */

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-[.7rem] font-semibold uppercase tracking-[.2em] text-foreground/35">
      {children}
    </h3>
  );
}

function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-foreground/15 px-5 py-3 text-sm text-foreground/80 transition hover:border-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-emerald-400" />
      ) : (
        <MailIcon className="h-4 w-4 text-foreground/50 group-hover:text-accent" />
      )}
      <span aria-live="polite">{copied ? "Copied to clipboard" : email}</span>
    </button>
  );
}

function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5 text-foreground/45">
      <PinIcon className="h-3.5 w-3.5" />
      Hyderabad, IN
      {time && <span className="text-foreground/30">· {time} IST</span>}
    </span>
  );
}

function BackToTop() {
  function toTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={toTop}
      className="group inline-flex items-center gap-2 rounded-full border border-foreground/15 px-3.5 py-1.5 text-foreground/60 transition hover:border-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      Back to top
      <ArrowIcon className="h-3 w-3 -rotate-45 transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
}

/* ── Icons ──────────────────────────────────────── */

type IconProps = { className?: string };

function ArrowIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

function PinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
