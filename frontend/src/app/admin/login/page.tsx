"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import { siteConfig } from "@/lib/siteConfig";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-foreground/15 bg-foreground/5 px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-accent";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      await adminFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: String(form.get("email") || ""),
          password: String(form.get("password") || ""),
        }),
      });
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-5 py-16 sm:min-h-[calc(100vh-76px)]">
      <div
        className="pointer-events-none absolute -left-40 -top-52 h-160 w-160 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(182,0,168,.22), transparent 66%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-56 -right-36 h-150 w-150 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(190,76,0,.16), transparent 66%)" }}
      />

      <div className="relative w-full max-w-md rounded-4xl border border-foreground/15 bg-surface/90 p-8 backdrop-blur-xl sm:p-10">
        <div className="text-xl font-black uppercase tracking-wide text-foreground">
          {siteConfig.name.split(" ")[0]}
          <span className="text-accent">.</span>
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Admin login</h1>
        <p className="mt-2 text-sm font-light text-foreground/45">
          Sign in to manage posts and messages.
        </p>

        {error && (
          <div className="mt-4.5 rounded-2xl border border-red-400/35 bg-red-400/10 px-4 py-3.5 text-sm font-light text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div>
            <label
              htmlFor="email"
              className="text-xs font-light uppercase tracking-widest text-foreground/40"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="admin@example.com"
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-xs font-light uppercase tracking-widest text-foreground/40"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className={fieldClass}
            />
          </div>

          <Button type="submit" disabled={submitting} className="mt-2 w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
