import type { ApiResponse } from "./api";
import type { CoverImage } from "./post";

export type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Project {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  image?: CoverImage;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  category?: string;
  featured: boolean;
  displayOrder: number;
  status: ProjectStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// The public endpoint only returns published projects, without admin fields.
export type PublicProject = Omit<Project, "status" | "createdAt" | "updatedAt">;

export type ProjectListResponse = ApiResponse<Project[]>;

export type PublicProjectListResponse = ApiResponse<PublicProject[]>;

export type PublicProjectResponse = ApiResponse<PublicProject>;

export type ProjectResponse = ApiResponse<Project>;
