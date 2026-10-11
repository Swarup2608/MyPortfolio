import type { ApiResponse, PaginatedResponse } from "./api";

export type { Pagination } from "./api";

export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface CoverImage {
  url: string;
  key: string;
  alt: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: CoverImage;
  tags: string[];
  category?: string;
  status: PostStatus;
  author?: { _id: string; name: string } | string;
  publishedAt?: string | null;
  readingTimeInMinutes: number;
  viewCount: number;
  seo?: { title?: string; description?: string; keywords?: string[] };
  createdAt: string;
  updatedAt: string;
}

export type PostListItem = Pick<
  Post,
  "_id" | "title" | "slug" | "excerpt" | "coverImage" | "tags" | "publishedAt" | "readingTimeInMinutes"
> & { status?: PostStatus; viewCount?: number; createdAt?: string; updatedAt?: string };

export type PostListResponse = PaginatedResponse<PostListItem>;

export type PostResponse = ApiResponse<Post>;
