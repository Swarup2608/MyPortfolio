export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: PostStatus;
  author?: { _id: string; name: string } | string;
  publishedAt: string | null;
  readingTimeMinutes: number;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

export type PostListItem = Pick<
  Post,
  "_id" | "title" | "slug" | "excerpt" | "coverImage" | "tags" | "publishedAt" | "readingTimeMinutes"
> & { status?: PostStatus; views?: number; createdAt?: string; updatedAt?: string };

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PostListResponse {
  success: true;
  posts: PostListItem[];
  pagination: Pagination;
}

export interface PostResponse {
  success: true;
  post: Post;
}
