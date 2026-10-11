// Shapes returned by the /admin/* endpoints. These are the raw Mongoose
// documents server-side and deliberately differ from the curated public
// shapes in types/post.ts (uppercase status, nested image objects, etc).

export type AdminPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface AdminPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: { url: string; key: string; alt: string };
  tags: string[];
  category?: string;
  author: { _id: string; name: string; email?: string; role?: string } | string;
  status: AdminPostStatus;
  publishedAt?: string | null;
  seo?: { title?: string; description?: string; keywords?: string[] };
  readingTimeInMinutes: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export type AdminProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface AdminProject {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  image?: { url: string; key: string; alt: string };
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  category?: string;
  featured: boolean;
  displayOrder: number;
  status: AdminProjectStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ContactStatus = "NEW" | "READ" | "ARCHIVED";

export interface AdminContact {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "ADMIN" | "EDITOR" | "VIEWER";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "LOGIN"
  | "LOGOUT"
  | "STATUS_CHANGE"
  | "PASSWORD_CHANGE";

export interface AuditLogEntry {
  _id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type AnalyticsRange = "7d" | "30d" | "90d" | "1y";

export interface AnalyticsMetric {
  value: number;
  growth: number;
}

export interface AnalyticsDashboard {
  range: { startDate: string; endDate: string };
  overview: {
    totalViews: AnalyticsMetric;
    uniqueVisitors: AnalyticsMetric;
    uniqueSessions: AnalyticsMetric;
    averagePagesPerSession: number;
    bounceRate: number;
  };
  daily: { date: string; views: number; uniqueVisitors: number }[];
  devices: { deviceType: string; views: number }[];
  popularPages: { path: string; views: number; uniqueVisitors: number }[];
  popularPosts: { postId: string; title: string; views: number; uniqueVisitors: number }[];
  referrers: { referrer: string; views: number }[];
}
