import {z} from "zod";

const slugSchema = z.string().trim().min(3).max(200).regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain only lowercase letters, numbers, and hyphens"
);

export const createProjectSchema = z.object({
    title: z.string().trim().min(2).max(200),
    slug: slugSchema,
    shortDescription : z.string().trim().min(1).max(300),
    description: z.string().min(1),
    image: z.object({
        url : z.string().url(),
        key : z.string().min(1),
        alt : z.string().trim().max(200)
    }).optional(),
    technologies: z.array(z.string().trim().min(1).max(50)).default([]),
    githubUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    category: z.string().trim().max(100).optional(),
    featured: z.boolean().default(false),
    displayOrder : z.number().int().min(0).default(0),
});

export type createProjectInput = z.infer<typeof createProjectSchema>;