import type { NextConfig } from "next";

const BACKEND_API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // The browser calls the API at /api on this site's own domain and Next proxies
  // it to the backend. That keeps the auth/CSRF cookies first-party, so they are
  // sent even though the backend lives on a different domain (SameSite=Lax and
  // third-party cookie blocking would otherwise drop them).
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_API_URL}/:path*` }];
  },
};

export default nextConfig;
