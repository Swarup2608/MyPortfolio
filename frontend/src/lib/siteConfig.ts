// Single source of truth for personal/portfolio content.
// Edit these values directly — no CMS needed for this part,
// only blog posts are database-backed.

export const siteConfig = {
  name: "Swarup",
  firstName: "M N Santhi",
  lastName: "Swarup",
  title: "Full-Stack Developer",
  tagline: "I build products end to end — from the first idea to deployment.",
  bio: "I'm a Full Stack Developer with 3.5+ years of experience building scalable web applications and AI-powered products end to end — from React and Next Frontend to Node.js and NestJS backend, APIs and databases. I build MCP servers, custom plugins and LLM-powered features that bring AI straight into real products and developer workflows.",
  location: "Hyderabad, India",
  email: "swarupmantripragada@gmail.com",
  social: {
    github: "https://github.com/Swarup2608",
    linkedin: "https://linkedin.com/in/swarup2608",
  },
  // The PDF lives in frontend/public; the home page's Resume button downloads it.
  // Set to "" to hide the button.
  resumeUrl: "/M_N_Santhi_Swarup_Resume.pdf",
  about:
    "I build products end to end, from the first idea to deployment, across React and Next Frontend, Node.js and NestJS backend, and AI.",
  goals:
    "I want to build products that solve meaningful problems and make a lasting impact on developers and millions of users. I'm looking to grow at a product-focused company, working across full-stack engineering, AI and design, and taking real ownership of what I ship.",
} as const;

// Shown as bullet points on the About page (render with aboutPoints.map).
export const aboutPoints: string[] = [
  "3.5+ years building full-stack products end to end, from idea to deployment",
  "Built 3+ MCP servers and 3+ custom plugins connecting Figma, the design system and source code — used by 3 teams and 15 developers",
  "Maintain a React design system with 25+ reusable components, keeping UI consistent across 3 product teams",
  "Built 20+ AI agent skills and workflows that automate repetitive development tasks",
  "Shipped 6 full-stack projects, including Feature Pulse and an AI e-commerce platform with image-based recommendations",
  "Integrate LLMs (Claude and Gemini APIs) and Python models into real products",
  "Migrated a client platform from OutSystems to the MERN stack, owning development and support across both",
  "Designed REST APIs and data models with Node.js, NestJS, MongoDB and PostgreSQL",
  "3 awards at Evoke Technologies: 2× Pat on the Back and a Best Team Award",
];

export const skills: { category: string; items: string[] }[] = [
  { category: "Frontend", items: ["React", "TypeScript", "JavaScript", "Tailwind CSS", "HTML/CSS"] },
  { category: "Backend", items: ["Node.js", "Express", "NestJS", "Java", "Python", "REST APIs"] },
  { category: "Data", items: ["MongoDB", "PostgreSQL", "MySQL"] },
  { category: "AI", items: ["LLMs", "MCP Servers", "Claude API", "Gemini API", "AI Agents", "Python"] },
  { category: "Tooling", items: ["Git", "Figma", "Figma Plugins", "OutSystems"] },
];

export const experience: { range: string; role: string; org: string; desc: string }[] = [
  {
    range: "Feb 2023 — Now",
    role: "Full-Stack Developer",
    org: "Evoke Technologies",
    desc: "Build and maintain a design system used by multiple product teams; created Figma plugins and MCP servers that bring components into developers' workflows; helped migrate a client platform from OutSystems to the MERN stack.",
  },
  {
    range: "Jul 2020 — Aug 2021",
    role: "Freelance Designer & Web Developer",
    org: "Webrup Designers",
    desc: "Designed websites, logos and flyers for clients, and built responsive sites with HTML, CSS, JavaScript and PHP/MySQL, including a product showcase for Nizmet.",
  },
];

export const achievements: { year: string; title: string; org: string }[] = [
  {
    year: "2025",
    title: "Pat on the Back Award (×2)",
    org: "Evoke Technologies · Mar 2025 & Oct 2023",
  },
  {
    // Add the year you received it
    year: "",
    title: "Best Team Award",
    org: "Evoke Technologies",
  },
];

export const education: { year: string; title: string; org: string }[] = [
  {
    year: "2025",
    title: "IBM Machine Learning Certification",
    org: "IBM",
  },
  {
    year: "2024",
    title: "OutSystems Mobile Developer & O11 Associate Reactive Developer",
    org: "OutSystems",
  },
  {
    // Add the year you completed it
    year: "",
    title: "Foundations of User Experience (UX) Design",
    org: "Google · Coursera",
  },
  {
    year: "2023",
    title: "B.Tech, Computer Science Engineering",
    org: "Vignan's Institute of Information Technology",
  },
];

export const philosophy =
  "User experience comes first. Own the problem, not just the code — and solve root causes, not symptoms.";

export const services: { num: string; name: string; desc: string }[] = [
  {
    num: "01",
    name: "Full-stack product development",
    desc: "I take products from idea to production with React, Node.js and NestJS, built for scale, performance and clean architecture.",
  },
  {
    num: "02",
    name: "AI-powered applications",
    desc: "I integrate LLMs and AI models into real products, from smart recommendations to automated insights.",
  },
  {
    num: "03",
    name: "Design systems & UI engineering",
    desc: "I build reusable components, design guidelines and accessible interfaces that keep products consistent across teams.",
  },
  {
    num: "04",
    name: "Developer tools & MCP servers",
    desc: "I create plugins and Model Context Protocol servers that bring the right tools straight into developers' workflows.",
  },
  {
    num: "05",
    name: "API & backend engineering",
    desc: "I design reliable, well-structured APIs and data models with MongoDB and PostgreSQL.",
  },
];

export const process: { title: string; desc: string }[] = [
  {
    title: "Discover",
    desc: "Understand the problem, the users and the constraints before writing any code.",
  },
  {
    title: "Plan",
    desc: "Sketch the architecture and break the work into small, shippable pieces.",
  },
  {
    title: "Build",
    desc: "Write clean, tested, maintainable code, and fix root causes rather than symptoms.",
  },
  {
    title: "Ship",
    desc: "Deploy, monitor and refine based on real user feedback.",
  },
];

// Real numbers, written conservatively.
export const highlights: { value: string; label: string }[] = [
  { value: "3.5+", label: "Years experience" },
  { value: "6", label: "Full-stack projects shipped" },
  { value: "15", label: "Developers using my tools" },
  { value: "20+", label: "AI agent skills built" },
];
