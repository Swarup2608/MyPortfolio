"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/siteConfig";

const siteLinks = [
  { href: "/about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/blog", label: "Journal" },
  { href: "/#contact", label: "Contact" },
];

const socials = [
  { label: "GitHub", href: siteConfig.social.github },
  { label: "LinkedIn", href: siteConfig.social.linkedin },
  { label: "Twitter", href: siteConfig.social.twitter },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-foreground/10 px-5 pb-8 pt-14 sm:px-10 sm:pt-20">
      <Container className="max-w-6xl">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="max-w-xs">
            <div className="text-xl font-black uppercase tracking-wide text-foreground">
              {siteConfig.name.split(" ")[0]}
              <span className="text-accent">.</span>
            </div>
            <p className="mt-3.5 text-sm font-light leading-relaxed text-foreground/45">
              {siteConfig.tagline}
            </p>
          </div>

          <div className="flex flex-wrap gap-14 sm:gap-16">
            <div>
              <div className="mb-3.5 text-[.68rem] font-light uppercase tracking-widest text-foreground/35">
                Site
              </div>
              {siteLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-1 text-sm font-light text-foreground transition-opacity hover:opacity-60"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div>
              <div className="mb-3.5 text-[.68rem] font-light uppercase tracking-widest text-foreground/35">
                Elsewhere
              </div>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block py-1 text-sm font-light text-foreground transition-opacity hover:opacity-60"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-4 border-t border-foreground/8 pt-5 text-xs font-light text-foreground/35 sm:mt-12">
          <span>
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </span>
          <Link href="/admin/login" className="hover:text-foreground/60">
            Admin
          </Link>
        </div>
      </Container>
    </footer>
  );
}
