"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/lib/siteConfig";
import { API_URL, ApiError } from "@/lib/api";

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-foreground/15 bg-foreground/5 px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-accent";

export function ContactSection() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    // React clears e.currentTarget once the handler yields, so grab the form before awaiting.
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || "").trim(),
      message: String(form.get("message") || ""),
      website: String(form.get("website") || ""), // honeypot
    };

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new ApiError(res.status, data?.message || "Something went wrong");

      setStatus("success");
      toast.success("Thanks — your message has been sent.");
      formEl.reset();
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
    <section id="contact" className="scroll-mt-16 border-t border-foreground/10 py-24 sm:py-32">
      <Container className="max-w-2xl text-center">
        <Reveal>
          <h2 className="gradient-text text-5xl font-black uppercase leading-[0.95] tracking-tighter sm:text-7xl">
            Let&apos;s build something great
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 text-sm font-light text-foreground/55 sm:text-base">
            Have a project in mind or just want to say hi? Send a message, or email me directly at{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-accent">
              {siteConfig.email}
            </a>
            .
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <form onSubmit={handleSubmit} className="mt-10 space-y-4 text-left">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="text-xs font-light uppercase tracking-widest text-foreground/40"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  className={fieldClass}
                />
              </div>
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
                  maxLength={200}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-xs font-light uppercase tracking-widest text-foreground/40"
              >
                Mobile number <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                pattern="\+?[0-9\s\(\)\-]{7,20}"
                title="Digits, spaces, +, ( ) and - only"
                placeholder="+91 98765 43210"
                className={fieldClass}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="text-xs font-light uppercase tracking-widest text-foreground/40"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                minLength={10}
                maxLength={5000}
                className={fieldClass}
              />
            </div>

            <div className="pt-2 text-center">
              <Button type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Sending…" : "Send message"}
              </Button>
            </div>
          </form>
        </Reveal>
      </Container>
    </section>
  );
}
