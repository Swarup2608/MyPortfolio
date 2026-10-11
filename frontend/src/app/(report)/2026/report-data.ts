export type CategoryKey = "genai" | "ml" | "web" | "cloud";

export const CAT: Record<CategoryKey, { label: string; c: string; cs: string }> = {
  genai: { label: "Generative AI and prompting", c: "--violet", cs: "--violet-soft" },
  ml: { label: "Machine learning and Python", c: "--teal", cs: "--teal-soft" },
  web: { label: "Next.js and web", c: "--amber", cs: "--amber-soft" },
  cloud: { label: "Cloud and observability", c: "--rose", cs: "--rose-soft" },
};

export type Course = [title: string, category: CategoryKey, format: string, minutes: number, completed: string];

export const courses: Course[] = [
  ["Grafana Concepts and Basic Configuration", "cloud", "Course", 25, "2026-09-29"],
  ["Building Machine Learning Models in Python with scikit-learn", "ml", "Course", 193, "2026-09-29"],
  ["Data Science with Python: Foundations of Machine Learning", "ml", "Course", 40, "2026-09-11"],
  ["Python 3: The Big Picture", "ml", "Course", 52, "2026-09-09"],
  ["Data Fetching and API Routes in Next.js 14", "web", "Course", 81, "2026-08-28"],
  ["Using the App Router in Next.js 14", "web", "Course", 90, "2026-07-20"],
  ["NLP and Transformer Models", "ml", "Course", 77, "2026-06-22"],
  ["Neural Networks Demystified for Data Professionals", "ml", "Course", 24, "2026-06-15"],
  ["Key Concepts Machine Learning", "ml", "Course", 127, "2026-06-08"],
  ["Prompt Engineering Best Practices", "genai", "Lab", 14, "2026-05-30"],
  ["ChatGPT Prompt Engineering and Evaluation", "genai", "Lab", 30, "2026-04-08"],
  ["Next.js 14: Foundations", "web", "Course", 92, "2026-04-06"],
  ["Advanced Prompt Engineering", "genai", "Course", 91, "2026-04-06"],
  ["Prompt Engineering for Improved Performance", "genai", "Course", 55, "2026-04-02"],
  ["Generative AI Foundations: Getting Started", "genai", "Course", 29, "2026-04-01"],
  ["Prompt Engineering Best Practices", "genai", "Course", 65, "2026-04-01"],
  ["Getting Started on Prompt Engineering with Generative AI", "genai", "Course", 48, "2026-03-24"],
  ["Generative AI Foundations: Generative AI in Action", "genai", "Course", 39, "2026-03-18"],
  ["Generative AI Foundations: Ethics, Issues, and Limitations of Generative AI", "genai", "Course", 28, "2026-03-17"],
  ["Generative AI Foundations - Prompt Engineering", "genai", "Course", 37, "2026-03-17"],
  ["AWS Identity and Access Management Fundamentals", "cloud", "Interactive course", 20, "2026-03-11"],
  ["Getting Started with the AWS Management Console", "cloud", "Interactive course", 22, "2026-03-11"],
  ["Understanding AWS and its Global Infrastructure", "cloud", "Course", 19, "2026-03-11"],
  ["Generative AI Foundations: Prompt Engineering", "genai", "Course", 25, "2026-02-24"],
];

export const inProgress: [title: string, percent: number][] = [
  ["Flutter Fundamentals", 85],
  ["Core Concepts of Generative AI for Developers", 79],
  ["AWS Compute Fundamentals", 64],
  ["Foundations of Statistics and Probability for Machine Learning", 59],
];

export const formatMinutes = (m: number) => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h ${r ? `${r}m` : ""}`.trim() : `${r}m`;
};

export const formatDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
