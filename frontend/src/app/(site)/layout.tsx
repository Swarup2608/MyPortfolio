import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { siteConfig } from "@/lib/siteConfig";
import { ThemeProvider, themeInitScript } from "@/lib/themeContext";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.firstName} ${siteConfig.lastName} — ${siteConfig.title}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${kanit.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <PageViewTracker />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ThemeSwitcher />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "var(--surface)",
                color: "var(--foreground)",
                border: "1px solid rgba(215, 226, 234, 0.14)",
                fontSize: "0.875rem",
              },
              success: { iconTheme: { primary: "var(--accent)", secondary: "var(--surface)" } },
              error: { iconTheme: { primary: "#f87171", secondary: "var(--surface)" } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
