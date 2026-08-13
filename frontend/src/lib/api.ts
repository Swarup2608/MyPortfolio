export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Safe for both server components (public reads) and client components.
// Never sends credentials — use adminFetch from lib/adminApi.ts for authenticated calls.
export async function publicFetch<T>(
  path: string,
  init?: RequestInit & { revalidate?: number }
): Promise<T> {
  const { revalidate, ...rest } = init ?? {};

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    next: revalidate !== undefined ? { revalidate } : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.message || "Request failed");
  }

  return data as T;
}
