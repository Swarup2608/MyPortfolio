export interface Project {
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
  publishedAt: string | null;
}

export interface ProjectListResponse {
  success: true;
  data: Project[];
}

export interface ProjectResponse {
  success: true;
  data: Project;
}
