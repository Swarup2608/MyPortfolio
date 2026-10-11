"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

// Routes that render their own full-bleed chrome and skip the global nav/footer.
const CHROMELESS_ROUTES = new Set(["/coming-soon"]);

function isChromeless(pathname: string) {
  return CHROMELESS_ROUTES.has(pathname) || pathname === "/admin" || pathname.startsWith("/admin/");
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isChromeless(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
