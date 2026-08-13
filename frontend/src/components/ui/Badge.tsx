import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-foreground/15 px-3.5 py-1.5 text-xs font-light text-foreground/70",
        className
      )}
    >
      {children}
    </span>
  );
}
