"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/siteConfig";

const links = [
  { href: "/about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/blog", label: "Journal" },
  { href: "/#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/80 backdrop-blur-xl">
      <Container>
        <nav className="flex h-16 items-center justify-between sm:h-19">
          <Link
            href="/"
            className="text-lg font-black uppercase tracking-wide text-foreground sm:text-xl"
          >
            {siteConfig.name.split(" ")[0]}
            <span className="text-accent">.</span>
          </Link>

          <ul className="hidden items-center gap-8 sm:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium uppercase tracking-wider text-foreground/85 transition-opacity hover:opacity-70"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden sm:block">
            <Link
              href="/#contact"
              className="gradient-cta inline-flex items-center justify-center rounded-full px-7 py-3 text-xs font-medium uppercase tracking-widest text-white transition-transform hover:-translate-y-0.5"
            >
              Let&apos;s Talk
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-foreground/20 sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              {open ? (
                <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="2" />
              ) : (
                <path d="M1 4h16M1 9h16M1 14h16" stroke="currentColor" strokeWidth="2" />
              )}
            </svg>
          </button>
        </nav>

        {open && (
          <ul className="flex flex-col gap-1 border-t border-foreground/10 py-3 sm:hidden">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-sm font-medium uppercase tracking-wide text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </header>
  );
}
