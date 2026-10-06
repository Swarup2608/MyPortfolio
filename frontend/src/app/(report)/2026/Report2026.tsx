"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { buildChart, cssVar, getChartGlobal, type ChartId, type ChartInstance } from "./charts";
import { CAT, courses, formatDate, formatMinutes, inProgress, type CategoryKey } from "./report-data";

type FilterKey = "all" | CategoryKey;

declare global {
  interface Window {
    html2canvas?: (el: HTMLElement, options: Record<string, unknown>) => Promise<HTMLCanvasElement>;
    jspdf?: {
      jsPDF: new (options: Record<string, unknown>) => {
        addPage(): void;
        setFillColor(r: number, g: number, b: number): void;
        rect(x: number, y: number, w: number, h: number, style: string): void;
        addImage(data: string, format: string, x: number, y: number, w: number, h: number): void;
        save(name: string): void;
      };
    };
  }
}

const CATEGORY_KEYS = Object.keys(CAT) as CategoryKey[];

const BAND_ITEMS = [
  "Figma Code Connect",
  "WCAG and ARIA",
  "SSR hardening",
  "Design tokens",
  "Storybook CI linting",
  "CSP remediation",
  "Ribbon component",
  "Data Well component",
  "Release v1.13.1",
  "Generative AI",
  "scikit-learn",
  "Next.js 14",
  "AWS",
  "Grafana",
];

const DOMAINS = [
  { color: "var(--violet)", name: "Design-to-code tooling", note: "about 40 tickets", width: 100, share: "37.0%" },
  { color: "var(--teal)", name: "New components", note: "about 18 tickets", width: 45.1, share: "16.7%" },
  { color: "var(--amber)", name: "Tokens, UI polish and SSR", note: "about 14 tickets", width: 35.1, share: "13.0%" },
  { color: "#4F8EF7", name: "Docs and Storybook", note: "about 13 tickets", width: 32.4, share: "12.0%" },
  { color: "var(--slate)", name: "Security, CI and releases", note: "about 12 tickets", width: 30, share: "11.1%" },
  { color: "var(--rose)", name: "Accessibility", note: "about 11 tickets", width: 27.6, share: "10.2%" },
];

type Area = {
  color: string;
  soft: string;
  share: string;
  title: string;
  items: [lead: string, rest: ReactNode][];
};

const AREAS: Area[] = [
  {
    color: "var(--violet)",
    soft: "var(--violet-soft)",
    share: "37.0% of my work",
    title: "Design-to-code tooling",
    items: [
      ["Figma Code Connect on 35+ components.", " Designers and engineers see the real production code right inside Figma, so nobody guesses during handoff."],
      ["Drift warnings.", " The tooling flags when a Figma spec and the code no longer match."],
      ["Reusable packages.", " Split the tooling into standalone packages other teams can use."],
    ],
  },
  {
    color: "var(--teal)",
    soft: "var(--teal-soft)",
    share: "16.7% of my work",
    title: "New components, built end to end",
    items: [
      ["Ribbon.", " From design sync and API design to code, styling, docs and Figma mapping."],
      ["Data Well.", " Same full cycle, plus Storybook examples and an accessibility audit."],
      ["Shared building blocks.", " One hook for checked state used by all toggle-style controls, and definition list support."],
    ],
  },
  {
    color: "var(--amber)",
    soft: "var(--amber-soft)",
    share: "13.0% of my work",
    title: "Tokens, UI polish and SSR",
    items: [
      ["Figma and code match.", " Fixed radius and spacing tokens that differed between design and code."],
      [
        "No more SSR crashes.",
        <> Guarded browser-only <code>document</code> calls that broke server rendering.</>,
      ],
      ["Cleaner tests.", " Removed forwardRef warnings and evened out button sizes and weights."],
    ],
  },
  {
    color: "#4F8EF7",
    soft: "var(--surface-2)",
    share: "12.0% of my work",
    title: "Docs and Storybook",
    items: [
      ["Storybook stories", " for components in both light and dark mode."],
      ["Usage guides and API docs", " so product engineers can adopt components quickly."],
      ["Release notes", " with changelogs and breaking-change warnings for every release I ran."],
    ],
  },
  {
    color: "var(--slate)",
    soft: "var(--surface-2)",
    share: "11.1% of my work",
    title: "Security, CI and releases",
    items: [
      ["Checks before merge.", " Added Storybook linting to CI, so broken stories and props are caught early."],
      [
        "Safer docs sites.",
        <> Removed the need for <code>unsafe-eval</code> in the Content Security Policy.</>,
      ],
      ["Releases.", " Ran v1.11.0, v1.13.1 and the Code Connect rollouts, and moved repo configs to v4."],
    ],
  },
  {
    color: "var(--rose)",
    soft: "var(--rose-soft)",
    share: "10.2% of my work",
    title: "Accessibility",
    items: [
      ["Screen readers.", " Fixed how half-checked checkboxes are announced."],
      ["Keyboard and ARIA.", " Fixed a focus trap on radios and wrong ARIA on loading spinners."],
      ["Dialogs and tooltips.", " Fixed modal focus handling and audited tooltips against WCAG. Fixes sit in the library, so every product gets them."],
    ],
  },
];

const FOOT_GROUPS = [
  {
    big: true,
    color: "var(--violet)",
    title: "Forms and inputs",
    count: 10,
    chips: ["Input", "Textarea", "Radio", "Checkbox", "SwitchInput", "FileUpload", "Select", "FieldMessage", "Date Picker inputs", "Checked-state hook"],
  },
  {
    color: "var(--teal)",
    title: "Navigation and structure",
    count: 8,
    chips: ["Accordion", "Tabs", "SegmentedControl", "Menu", "Table", "TextLink", "Lists (DL, UL, OL)", "EmptyState"],
  },
  {
    color: "var(--rose)",
    title: "Feedback and overlays",
    count: 8,
    chips: ["Modal", "Popover", "Tooltip", "Toast", "Badge", "Chip", "Prompt Dialog", "StarRating"],
  },
  {
    color: "var(--amber)",
    title: "Layout and presentation",
    count: 6,
    chips: ["Ribbon", "Data Well", "Button", "IconButton", "Avatar", "Banner"],
  },
  {
    color: "var(--slate)",
    title: "Progress and loading",
    count: 3,
    chips: ["CircularProgress", "LoadingSpinner", "Skeleton"],
  },
];

const PDF_BREAK_SELECTOR =
  "header.stage,.band,.sec-head,.chart-row,.area,.learn-grid,.learn-grid > .panel,.courses tbody tr,#learning > h3,.prog,.prog-item,.strip,.domains .dom,.foot,.fgroup,.team,.next-grid,.closing";

const vars = (values: Record<string, string>) => values as CSSProperties;

const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function countUp(el: HTMLElement, reduce: boolean) {
  const end = Number(el.dataset.count);
  const suffix = el.dataset.suffix ?? "";
  if (reduce) {
    el.textContent = end + suffix;
    return;
  }
  const t0 = performance.now();
  const duration = 1600;
  const frame = (t: number) => {
    const p = Math.min((t - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(end * eased) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

export function Report2026() {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const revealObserver = useRef<IntersectionObserver | null>(null);
  const revealedCharts = useRef(new Set<ChartId>());
  const charts = useRef<Partial<Record<ChartId, ChartInstance>>>({});

  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState<FilterKey>("all");
  const [toast, setToast] = useState({ message: "", visible: false });
  const [exporting, setExporting] = useState(false);

  const buildCharts = useCallback(() => {
    const Chart = getChartGlobal();
    if (!Chart) return;
    Chart.defaults.font.family = cssVar("--body");
    Chart.defaults.color = cssVar("--muted");
    revealedCharts.current.forEach((id) => {
      if (!charts.current[id]) charts.current[id] = buildChart(id, Chart, prefersReducedMotion());
    });
  }, []);

  const destroyCharts = useCallback(() => {
    Object.values(charts.current).forEach((chart) => chart?.destroy());
    charts.current = {};
  }, []);

  const revealAll = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
      el.classList.add("in");
      revealObserver.current?.unobserve(el);
    });
    root.querySelectorAll("canvas").forEach((c) => revealedCharts.current.add(c.id as ChartId));
    buildCharts();
    Object.values(charts.current).forEach((chart) => {
      chart?.stop();
      chart?.update("none");
    });
    root.querySelectorAll<HTMLElement>("[data-w]").forEach((s) => {
      s.style.transition = "none";
      s.style.width = `${s.dataset.w}%`;
    });
    root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      el.textContent = (el.dataset.count ?? "") + (el.dataset.suffix ?? "");
    });
  }, [buildCharts]);

  const say = useCallback((message: string, ms?: number) => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    if (ms) {
      toastTimer.current = window.setTimeout(() => setToast((t) => ({ ...t, visible: false })), ms);
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onScroll = () => {
      setSolid(window.scrollY > 40);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) {
        progressRef.current.style.width = `${h > 0 ? (window.scrollY / h) * 100 : 0}%`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const reduce = prefersReducedMotion();
    root.querySelectorAll<SVGCircleElement>(".arc").forEach((c) => {
      const len = 2 * Math.PI * c.r.baseVal.value;
      c.style.strokeDasharray = String(len);
      c.style.strokeDashoffset = String(len);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          c.style.strokeDashoffset = String(len * (1 - Number(c.dataset.pct) / 100));
        }),
      );
    });
    root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => countUp(el, reduce));

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.classList.add("in");
          el.querySelectorAll("canvas").forEach((c) => revealedCharts.current.add(c.id as ChartId));
          buildCharts();
          el.querySelectorAll<HTMLElement>("[data-w]").forEach((s) => {
            s.style.width = `${s.dataset.w}%`;
          });
          io.unobserve(el);
        }),
      { threshold: 0.15 },
    );
    revealObserver.current = io;
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    window.addEventListener("beforeprint", revealAll);

    const colorScheme = matchMedia("(prefers-color-scheme: dark)");
    const redraw = () => {
      destroyCharts();
      buildCharts();
    };
    colorScheme.addEventListener("change", redraw);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeprint", revealAll);
      colorScheme.removeEventListener("change", redraw);
      io.disconnect();
      destroyCharts();
      window.clearTimeout(toastTimer.current);
    };
  }, [buildCharts, destroyCharts, revealAll]);

  const savePdf = async () => {
    const { html2canvas, jspdf } = window;
    if (!html2canvas || !jspdf) {
      say("PDF tools are still loading. Try again in a moment.", 3000);
      return;
    }
    setExporting(true);
    say("Preparing your PDF…");
    const root = document.documentElement;
    const y0 = window.scrollY;
    try {
      revealAll();
      root.classList.add("exporting");
      await new Promise((r) => setTimeout(r, 250));

      const target = document.body;
      const W = target.scrollWidth;
      const H = target.scrollHeight;
      const breaks = [...document.querySelectorAll(PDF_BREAK_SELECTOR)]
        .map((el) => Math.round(el.getBoundingClientRect().top + window.scrollY - 24))
        .filter((v) => v > 0)
        .sort((a, b) => a - b);
      const bg = getComputedStyle(target).backgroundColor;
      const scale = Math.min(2, window.devicePixelRatio > 1 ? 2 : 1.6);
      const canvas = await html2canvas(target, {
        scale,
        backgroundColor: bg,
        useCORS: true,
        logging: false,
        width: W,
        height: H,
        windowWidth: W,
        windowHeight: H,
        scrollX: 0,
        scrollY: 0,
      });

      const pdf = new jspdf.jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pw = 210;
      const ph = 297;
      const pageH = Math.floor((W * ph) / pw);
      const rgb = (bg.match(/\d+/g) ?? [255, 255, 255]).slice(0, 3).map(Number);
      let y = 0;
      let first = true;
      while (y < H - 2) {
        let end = Math.min(y + pageH, H);
        if (end < H) {
          const ok = breaks.filter((b) => b > y + pageH * 0.35 && b <= y + pageH);
          if (ok.length) end = ok[ok.length - 1];
        }
        const sliceH = end - y;
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = Math.round(sliceH * scale);
        const ctx = slice.getContext("2d");
        if (ctx) {
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(canvas, 0, Math.round(y * scale), canvas.width, slice.height, 0, 0, slice.width, slice.height);
        }
        if (!first) pdf.addPage();
        pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
        pdf.rect(0, 0, pw, ph, "F");
        pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pw, (sliceH * pw) / W);
        first = false;
        y = end;
      }
      pdf.save("Swarup-2026-Contribution-Report.pdf");
      say("PDF downloaded.", 2500);
    } catch (err) {
      console.error(err);
      say("Couldn't build the PDF here. Opening the print dialog instead.", 3500);
      root.classList.remove("exporting");
      setTimeout(() => window.print(), 400);
    } finally {
      root.classList.remove("exporting");
      setExporting(false);
      window.scrollTo(0, y0);
    }
  };

  const filterOptions: [FilterKey, string][] = [
    ["all", `All (${courses.length})`],
    ...CATEGORY_KEYS.map((k): [FilterKey, string] => [
      k,
      `${CAT[k].label} (${courses.filter((c) => c[1] === k).length})`,
    ]),
  ];

  return (
    <div ref={rootRef}>
      <div className="progress" ref={progressRef} />
      <div className={toast.visible ? "toast show" : "toast"} role="status" aria-live="polite">
        {toast.message}
      </div>

      <nav className={solid ? "nav solid" : "nav"} aria-label="Report sections">
        <div className="wrap">
          <a className="brand" href="#top">
            <span className="mark">S</span>Swarup
          </a>
          <div className="links">
            <a href="#delivery">Delivery</a>
            <a href="#focus">Focus</a>
            <a href="#components">Components</a>
            <a href="#learning">Learning</a>
            <a href="#next">Next</a>
          </div>
          <div className="nav-actions">
            <button className="btn primary" type="button" onClick={savePdf} disabled={exporting}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
              </svg>
              <span>Save as PDF</span>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="stage" id="top">
        <div className="grid-lines" aria-hidden="true" />
        <div className="wrap hero">
          <div>
            <span className="pill">
              <i />
              2026 appraisal cycle · Evoke Technologies
            </span>
            <h1>
              One in three tickets shipped this year <span className="soft">was mine.</span>
            </h1>
            <p className="lede">
              <b>98 tickets completed</b> on the design system across Figma Code Connect, accessibility, SSR stability,
              CI and releases, plus <b>24 courses</b> finished in generative AI, ML, Next.js and cloud.
            </p>
            <div className="hero-stats">
              <div>
                <b data-count="108">0</b>
                <span>Tickets worked</span>
              </div>
              <div>
                <b data-count="98">0</b>
                <span>Completed</span>
              </div>
              <div>
                <b data-count="35">0</b>
                <span>Components touched</span>
              </div>
              <div>
                <b data-count="24">0</b>
                <span>Courses finished</span>
              </div>
            </div>
          </div>
          <div>
            <div className="rings-wrap">
              <svg
                className="rings"
                viewBox="0 0 400 400"
                role="img"
                aria-label="Three rings: 34% share of team output, 90.7% completion rate, 72.2% feature work"
              >
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#B3ACFF" />
                    <stop offset="1" stopColor="#6F62FF" />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#7FF0DF" />
                    <stop offset="1" stopColor="#20B3A0" />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#FFD08A" />
                    <stop offset="1" stopColor="#F27596" />
                  </linearGradient>
                </defs>
                <g transform="rotate(-90 200 200)">
                  <circle className="track" cx="200" cy="200" r="180" fill="none" stroke="#FFFFFF" strokeOpacity={0.08} strokeWidth={22} />
                  <circle className="track" cx="200" cy="200" r="148" fill="none" stroke="#FFFFFF" strokeOpacity={0.08} strokeWidth={22} />
                  <circle className="track" cx="200" cy="200" r="116" fill="none" stroke="#FFFFFF" strokeOpacity={0.08} strokeWidth={22} />
                  <circle className="arc" data-pct="34.0" cx="200" cy="200" r="180" fill="none" strokeLinecap="round" stroke="url(#g1)" strokeWidth={22} />
                  <circle className="arc" data-pct="90.7" cx="200" cy="200" r="148" fill="none" strokeLinecap="round" stroke="url(#g2)" strokeWidth={22} />
                  <circle className="arc" data-pct="72.2" cx="200" cy="200" r="116" fill="none" strokeLinecap="round" stroke="url(#g3)" strokeWidth={22} />
                </g>
              </svg>
              <div className="ring-center">
                <b data-count="34" data-suffix="%">0%</b>
                <span>
                  of all 2026 project output
                  <br />
                  90 of 265 tickets
                </span>
              </div>
            </div>
            <div className="ring-legend">
              <div style={vars({ "--c": "#8E85FF" })}>
                <i />
                Share of team throughput
                <b>34.0%</b>
              </div>
              <div style={vars({ "--c": "#3ED3BF" })}>
                <i />
                Completion rate on my tickets
                <b>90.7%</b>
              </div>
              <div style={vars({ "--c": "#F7A27A" })}>
                <i />
                Proactive feature work
                <b>72.2%</b>
              </div>
            </div>
          </div>
        </div>
        <div className="band" aria-hidden="true">
          <div className="band-track">
            {[...BAND_ITEMS, ...BAND_ITEMS].map((item, i) => (
              <span key={i}>{item}</span>
            ))}
          </div>
        </div>
      </header>

      <main className="wrap">
        {/* DELIVERY */}
        <section className="block" id="delivery" aria-labelledby="del-title">
          <div className="sec-head reveal">
            <span className="sec-num">01</span>
            <div>
              <h2 id="del-title">Delivery</h2>
              <p>How much I shipped, how it compares to the team, and how the pace moved through the year.</p>
            </div>
          </div>

          <div className="strip reveal">
            <div style={vars({ "--c": "var(--teal)" })}>
              <b>98</b>
              <span>Completed (90 mine, 8 shared)</span>
            </div>
            <div style={vars({ "--c": "var(--amber)" })}>
              <b>3</b>
              <span>In progress or in review</span>
            </div>
            <div style={vars({ "--c": "var(--slate)" })}>
              <b>4</b>
              <span>In backlog</span>
            </div>
            <div style={vars({ "--c": "var(--rose)" })}>
              <b>3</b>
              <span>Closed as no longer needed</span>
            </div>
          </div>

          <div className="panel chart-row reveal">
            <div className="chart-side donut">
              <canvas id="shareChart" aria-label="Doughnut: 90 tickets by me, 175 by rest of team" />
              <div className="donut-center">
                <b>34.0%</b>
                <span>of team output</span>
              </div>
            </div>
            <div className="row-copy">
              <h3>Top contributor on the project</h3>
              <p>The team closed 265 design system tickets in 2026. I closed 90 of them, more than anyone else.</p>
              <ul className="legend-list">
                <li style={vars({ "--c": "var(--violet)" })}>
                  <i />
                  <span className="t">Closed by me</span>
                  <b>90</b>
                  <em>34.0%</em>
                </li>
                <li style={vars({ "--c": "var(--surface-2)" })}>
                  <i />
                  <span className="t">Rest of the team combined</span>
                  <b>175</b>
                  <em>66.0%</em>
                </li>
              </ul>
            </div>
          </div>

          <div className="panel chart-row flip reveal">
            <div className="chart-side bars-side">
              <canvas id="quarterChart" aria-label="Bar chart: Q1 11, Q2 43, Q3 35, Q4 1 so far" />
            </div>
            <div className="row-copy">
              <h3>Pace by quarter</h3>
              <p>A short ramp-up, then two strong quarters. Q2 was my busiest.</p>
              <ul className="legend-list q-list">
                <li>
                  <span className="q">Q1</span>
                  <span className="t">
                    Ramp-up
                    <small>Token alignment and security fixes</small>
                  </span>
                  <b>11</b>
                </li>
                <li>
                  <span className="q">Q2</span>
                  <span className="t">
                    Peak quarter
                    <small>Code Connect rollout, new components, releases</small>
                  </span>
                  <b>43</b>
                </li>
                <li>
                  <span className="q">Q3</span>
                  <span className="t">
                    Steady high output
                    <small>New primitives, CI linting, accessibility</small>
                  </span>
                  <b>35</b>
                </li>
                <li>
                  <span className="q">Q4</span>
                  <span className="t">
                    Just started
                    <small>Token refactor and documentation</small>
                  </span>
                  <b>1</b>
                </li>
              </ul>
            </div>
          </div>

          <div className="panel chart-row reveal">
            <div className="chart-side donut">
              <canvas id="typeChart" aria-label="Doughnut: 78 features, 21 bugs, 5 tasks, 4 security" />
              <div className="donut-center">
                <b>3.7 : 1</b>
                <span>features to bugs</span>
              </div>
            </div>
            <div className="row-copy">
              <h3>Mostly building, not fixing</h3>
              <p>For every bug I fixed, I shipped almost four new features. All security and infrastructure work is closed.</p>
              <ul className="legend-list">
                <li style={vars({ "--c": "var(--violet)" })}>
                  <i />
                  <span className="t">
                    Features
                    <small>71 of 78 done</small>
                  </span>
                  <b>78</b>
                  <em>91%</em>
                </li>
                <li style={vars({ "--c": "var(--rose)" })}>
                  <i />
                  <span className="t">
                    Bugs
                    <small>18 of 21 done</small>
                  </span>
                  <b>21</b>
                  <em>86%</em>
                </li>
                <li style={vars({ "--c": "var(--teal)" })}>
                  <i />
                  <span className="t">
                    Infrastructure tasks
                    <small>5 of 5 done</small>
                  </span>
                  <b>5</b>
                  <em>100%</em>
                </li>
                <li style={vars({ "--c": "var(--amber)" })}>
                  <i />
                  <span className="t">
                    Security fixes
                    <small>4 of 4 done</small>
                  </span>
                  <b>4</b>
                  <em>100%</em>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FOCUS */}
        <section className="block" id="focus" aria-labelledby="focus-title">
          <div className="sec-head reveal">
            <span className="sec-num">02</span>
            <div>
              <h2 id="focus-title">Where my time went</h2>
              <p>The 108 tickets fall into six areas. Each card below shows what I did in that area.</p>
            </div>
          </div>

          <div className="panel reveal" style={{ marginBottom: 20 }}>
            <div className="domains">
              {DOMAINS.map((d) => (
                <div className="dom" key={d.name} style={vars({ "--c": d.color })}>
                  <span className="name">
                    {d.name}
                    <small>{d.note}</small>
                  </span>
                  <div className="track">
                    <span data-w={d.width} />
                  </div>
                  <b>{d.share}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="areas">
            {AREAS.map((a) => (
              <article key={a.title} className="area reveal" style={vars({ "--c": a.color, "--cs": a.soft })}>
                <span className="tag">{a.share}</span>
                <h3>{a.title}</h3>
                <ul>
                  {a.items.map(([lead, rest], i) => (
                    <li key={i}>
                      <b>{lead}</b>
                      {rest}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* COMPONENTS */}
        <section className="block" id="components" aria-labelledby="comp-title">
          <div className="sec-head reveal">
            <span className="sec-num">03</span>
            <div>
              <h2 id="comp-title">35 components touched</h2>
              <p>My work reached every layer of the design system, from form inputs to page layout.</p>
            </div>
          </div>
          <div className="foot reveal">
            {FOOT_GROUPS.map((g) => (
              <div key={g.title} className={g.big ? "fgroup big" : "fgroup"} style={vars({ "--c": g.color })}>
                <header>
                  <h3>{g.title}</h3>
                  <b>{g.count}</b>
                </header>
                <div className="chips">
                  {g.chips.map((chip) => (
                    <span key={chip} className="chip">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LEARNING */}
        <section className="block" id="learning" aria-labelledby="learn-title">
          <div className="sec-head reveal">
            <span className="sec-num">04</span>
            <div>
              <h2 id="learn-title">Learning and upskilling</h2>
              <p>
                24 courses and hands-on labs completed at 100% between February and September 2026, about 22 hours of
                learning alongside delivery work.
              </p>
            </div>
          </div>

          <div className="learn-grid reveal">
            <div className="panel">
              <h3>Completions by month</h3>
              <p className="sub">Learning every month since February</p>
              <div className="chart-box">
                <canvas id="monthChart" aria-label="Stacked bar chart of courses completed per month" />
              </div>
            </div>
            <div className="panel">
              <h3>Time by subject</h3>
              <p className="sub">Hours on completed courses</p>
              <div className="chart-box">
                <canvas id="catChart" aria-label="Doughnut of learning hours by subject" />
              </div>
            </div>
          </div>

          <div className="panel reveal">
            <div className="filters" role="group" aria-label="Filter courses by subject">
              {filterOptions.map(([key, label]) => (
                <button
                  key={key}
                  className="filter"
                  type="button"
                  aria-pressed={key === active}
                  onClick={() => setActive(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="scroll-x">
              <table className="courses">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Subject</th>
                    <th>Format</th>
                    <th>Time</th>
                    <th>Completed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courses
                    .filter(([, category]) => active === "all" || category === active)
                    .map(([title, category, format, minutes, completed]) => (
                      <tr key={`${title}-${completed}`}>
                        <td className="title">{title}</td>
                        <td>
                          <span className="cat" style={vars({ "--cs": `var(${CAT[category].cs})` })}>
                            {CAT[category].label}
                          </span>
                        </td>
                        <td className="kind">{format}</td>
                        <td>{formatMinutes(minutes)}</td>
                        <td>{formatDate(completed)}</td>
                        <td className="done">100% complete</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <h3 className="reveal" style={{ margin: "40px 0 16px", fontSize: "1.5rem", fontWeight: 800 }}>
            Nearly there
          </h3>
          <div className="prog reveal">
            {inProgress.map(([title, percent]) => (
              <div key={title} className="prog-item">
                <p>{title}</p>
                <div>
                  <span className="pct">{percent}%</span>
                  <div className="track">
                    <span data-w={percent} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* NEXT */}
        <section className="block" id="next" aria-labelledby="next-title">
          <div className="sec-head reveal">
            <span className="sec-num">05</span>
            <div>
              <h2 id="next-title">How I work, and what&apos;s next</h2>
            </div>
          </div>

          <div className="team reveal">
            <div className="panel">
              <h3>Partner to design</h3>
              <p>Worked closely with designers so Figma tokens and code tokens use the same values and names.</p>
            </div>
            <div className="panel">
              <h3>Unblocking engineers</h3>
              <p>Code in Figma, clear docs and release notes mean product teams spend less time matching mockups and upgrading.</p>
            </div>
            <div className="panel">
              <h3>Code reviews</h3>
              <p>
                Reviewed pull requests across the repo, pushing for accessibility, correct token use, small bundles and
                solid TypeScript types.
              </p>
            </div>
          </div>

          <div className="next-grid reveal">
            <div className="panel">
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 18 }}>In flight now</h3>
              <div className="timeline">
                <div className="tl" style={vars({ "--c": "var(--amber)" })}>
                  <b>Layout token refactor</b>
                  <span className="badge b-prog">In progress</span>
                  <p>Replacing hardcoded padding, radius and gap with tokens</p>
                </div>
                <div className="tl" style={vars({ "--c": "var(--amber)" })}>
                  <b>Ribbon docs and specs</b>
                  <span className="badge b-prog">In progress</span>
                  <p>Docs, Figma examples and Storybook stories</p>
                </div>
                <div className="tl" style={vars({ "--c": "var(--violet)" })}>
                  <b>Ribbon preset styling</b>
                  <span className="badge b-rev">In review</span>
                  <p>Final styling presets and theme recipes</p>
                </div>
              </div>
            </div>
            <div className="panel">
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 18 }}>Goals for next cycle</h3>
              <ul className="goals">
                <li>
                  <i>1</i>
                  <div>
                    <b>Tokens everywhere</b>
                    <p>Finish moving every container to token-based spacing and radius, so themes work fully.</p>
                  </div>
                </li>
                <li>
                  <i>2</i>
                  <div>
                    <b>Visual checks in CI</b>
                    <p>Compare Figma tokens with rendered components automatically before each release.</p>
                  </div>
                </li>
                <li>
                  <i>3</i>
                  <div>
                    <b>Accessibility tests in CI</b>
                    <p>
                      Run axe-core checks on every Storybook story so accessibility regressions can&apos;t be merged.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="closing">
        <div className="wrap">
          <h2>90 tickets shipped. 35 components improved. 24 courses finished.</h2>
        </div>
      </footer>

      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"
        strategy="afterInteractive"
        onReady={buildCharts}
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
