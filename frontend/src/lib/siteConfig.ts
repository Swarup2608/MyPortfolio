// Single source of truth for placeholder personal/portfolio content.
// Edit these values directly to replace them with your real details —
// no CMS needed for this part, only blog posts are database-backed.

export const siteConfig = {
  name: "Swarup",
  firstName: "M N Santhi",
  lastName: "Swarup",
  title: "Full-Stack Developer",
  tagline: "I build fast, reliable web applications end to end.",
  bio: "I'm a full-stack developer who enjoys turning ideas into polished, production-ready products. This is a placeholder bio — replace it with a couple of sentences about your background, what you like building, and what you're looking for.",
  location: "Your City, Country",
  email: "you@example.com",
  social: {
    github: "https://github.com/your-username",
    linkedin: "https://linkedin.com/in/your-username",
    twitter: "https://x.com/your-username",
  },
  resumeUrl: "",
  about:
    "Placeholder — a longer paragraph about your background, how you got into development, and what kind of work excites you.",
  goals:
    "Placeholder — a paragraph on what you're currently working toward professionally.",
} as const;

export const skills: { category: string; items: string[] }[] = [
  { category: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { category: "Backend", items: ["Node.js", "Express", "REST APIs", "MongoDB"] },
  { category: "Tooling", items: ["Git", "Docker", "CI/CD", "Testing"] },
];


export const experience: { range: string; role: string; org: string; desc: string }[] = [
  {
    range: "2024 — Now",
    role: "Full-Stack Developer",
    org: "Company / Freelance",
    desc: "Placeholder — one line on what you built and the impact it had.",
  },
  {
    range: "2022 — 2024",
    role: "Software Developer",
    org: "Company Name",
    desc: "Placeholder — swap in your real role history here.",
  },
];

export const achievements: { year: string; title: string; org: string }[] = [
  {
    year: "2024",
    title: "Degree / Certification Name",
    org: "Institution",
  },
  {
    year: "2023",
    title: "Notable project or award",
    org: "Context",
  },
];

export const philosophy =
  "Placeholder — a short quote or personal statement about how you approach building software.";

export const services: { num: string; name: string; desc: string }[] = [
  {
    num: "01",
    name: "Web application development",
    desc: "Placeholder — describe how you take a product from idea to a fast, production-ready web app.",
  },
  {
    num: "02",
    name: "API & backend engineering",
    desc: "Placeholder — describe your approach to building reliable, well-documented APIs and services.",
  },
  {
    num: "03",
    name: "Database design",
    desc: "Placeholder — describe how you model data and keep it performant as a product grows.",
  },
  {
    num: "04",
    name: "DevOps & deployment",
    desc: "Placeholder — describe how you ship: CI/CD, hosting, monitoring, the tools you rely on.",
  },
  {
    num: "05",
    name: "Technical consulting",
    desc: "Placeholder — describe how you help teams make architecture or stack decisions.",
  },
];

export const process: { title: string; desc: string }[] = [
  {
    title: "Discover",
    desc: "Placeholder — understand the problem, users, and constraints before writing code.",
  },
  {
    title: "Plan",
    desc: "Placeholder — sketch the architecture and break the work into shippable pieces.",
  },
  {
    title: "Build",
    desc: "Placeholder — write clean, tested code and iterate quickly.",
  },
  {
    title: "Ship",
    desc: "Placeholder — deploy, monitor, and refine based on real feedback.",
  },
];

// "X" values are placeholders — replace with real numbers once you have them.
export const highlights: { value: string; label: string }[] = [
  { value: "X+", label: "Years experience" },
  { value: "X+", label: "Projects shipped" },
  { value: "X+", label: "Technologies used" },
  { value: "X+", label: "Happy clients" },
];

export type Project = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  liveUrl?: string;
  repoUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    description:
      "A short, punchy description of what this project does and the problem it solves. Replace with a real project.",
    tags: ["Next.js", "MongoDB", "Node.js"],
    liveUrl: "",
    repoUrl: "",
  },
  {
    slug: "project-two",
    title: "Project Two",
    description:
      "Another placeholder project card — swap in real work with a live demo or repo link.",
    tags: ["React", "Express", "TypeScript"],
    liveUrl: "",
    repoUrl: "",
  },
  {
    slug: "project-three",
    title: "Project Three",
    description:
      "A third placeholder project. Keep the ones that best show range: frontend, backend, and full-stack.",
    tags: ["Node.js", "PostgreSQL"],
    liveUrl: "",
    repoUrl: "",
  },
];
