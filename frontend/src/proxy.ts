import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that stay reachable even while MAINTENANCE_MODE is on — the coming
// soon page itself, the admin panel (so the site can still be managed), and
// any request for a static file (favicon, images, etc.).
function isBypassed(pathname: string) {
  return pathname === "/coming-soon" || pathname.startsWith("/admin") || pathname.includes(".");
}

export function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== "true") return NextResponse.next();

  if (isBypassed(request.nextUrl.pathname)) return NextResponse.next();

  return NextResponse.redirect(new URL("/coming-soon", request.url));
}

export const config = {
  matcher: ["/((?!_next).*)"],
};
