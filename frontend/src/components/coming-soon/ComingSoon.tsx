"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Instrument_Serif, Barlow } from "next/font/google";
import { ArrowUpRight } from "lucide-react";
import Hls from "hls.js";
import toast from "react-hot-toast";
import { siteConfig } from "@/lib/siteConfig";
import { API_URL, ApiError } from "@/lib/api";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-barlow",
});

// Placeholder stream — swap for your own Mux (or other HLS) URL when ready.
const VIDEO_SRC = "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

type Status = "idle" | "submitting" | "success" | "error";

export function ComingSoon() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(VIDEO_SRC);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = VIDEO_SRC;
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Coming soon subscriber",
          email,
          message: "Notify me when the site launches.",
          website: "",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new ApiError(res.status, data?.message || "Something went wrong");

      setStatus("success");
      toast.success("You're on the list — we'll email you at launch.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      const message =
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the server. Check your connection and try again.";
      toast.error(message);
    }
  }

  return (
    <section
      className={`${barlow.variable} relative min-h-screen overflow-hidden bg-black px-6 py-32 text-center md:px-16 lg:px-24`}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />

      <div
        className="pointer-events-none absolute top-0 right-0 left-0 z-[1]"
        style={{ height: "200px", background: "linear-gradient(to bottom, black, transparent)" }}
      />
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 z-[1]"
        style={{ height: "200px", background: "linear-gradient(to top, black, transparent)" }}
      />

      <div className="relative z-10 flex min-h-[calc(100vh-16rem)] flex-col justify-center">
        <h1
          className={`${instrumentSerif.className} mx-auto mb-4 max-w-3xl text-5xl leading-[0.85] tracking-tight text-white italic md:text-6xl lg:text-7xl`}
        >
          Something new is coming.
        </h1>
        <p className="font-body mx-auto mb-8 max-w-xl text-sm font-light text-white/60 md:text-base">
          We&apos;re rebuilding {siteConfig.name}&apos;s site from the ground up. Leave your
          email and we&apos;ll let you know the moment it&apos;s live.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-md flex-col items-center gap-4"
        >
          <div className="liquid-glass-strong flex w-full items-center gap-2 rounded-full py-2 pr-2 pl-6">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="font-body w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              aria-label="Notify me"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition-opacity hover:bg-white/90 disabled:opacity-50"
            >
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        <Link
          href="/"
          className="font-body mt-8 inline-block text-xs font-light tracking-widest text-white/40 uppercase transition-colors hover:text-white/70"
        >
          ← Back to the live site
        </Link>

        <div className="mt-32 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="font-body text-xs font-light text-white/40">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-body text-xs font-light text-white/40 transition-colors hover:text-white/70"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="font-body text-xs font-light text-white/40 transition-colors hover:text-white/70"
            >
              Journal
            </Link>
            <a
              href={`mailto:${siteConfig.email}`}
              className="font-body text-xs font-light text-white/40 transition-colors hover:text-white/70"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
