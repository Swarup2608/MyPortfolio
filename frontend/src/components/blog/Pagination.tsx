import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Pagination as PaginationType } from "@/types/post";

function buildHref(basePath: string, params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  next.set("page", String(page));
  return `${basePath}?${next.toString()}`;
}

export function Pagination({
  pagination,
  basePath,
  searchParams,
}: {
  pagination: PaginationType;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (pagination.pages <= 1) return null;

  const params = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-2">
      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={buildHref(basePath, params, page)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium",
            page === pagination.page
              ? "gradient-cta text-white"
              : "border border-foreground/15 text-foreground/60 hover:bg-foreground/5"
          )}
        >
          {page}
        </Link>
      ))}
    </nav>
  );
}
