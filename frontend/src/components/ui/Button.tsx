import Link from "next/link";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium uppercase tracking-wider transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none px-8 py-3.5";

const variants = {
  primary: "gradient-cta text-white hover:-translate-y-0.5",
  secondary:
    "border border-foreground/40 text-foreground hover:bg-foreground/10 outline-none px-8 py-3",
  ghost: "text-foreground/60 hover:text-foreground outline-none normal-case tracking-normal",
  danger: "border border-red-400/35 text-red-400 hover:bg-red-400/10 outline-none px-8 py-3",
};

type Variant = keyof typeof variants;

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}
