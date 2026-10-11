import {z} from "zod";

const slugSchema = z.string().trim().min(3).max(200).regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain only lowercase letters, numbers, and hyphens"
);

export const projectImageSchema = z.object({
    url : z.string().url(),
    key : z.string().min(1),
    alt : z.string().trim().max(200).default("")
});

// No defaults here: updates are built from this with .partial(), and Zod 4 fills in
// defaults even for omitted optional fields, which would reset them on every update.
export const projectFieldsSchema = z.object({
    title: z.string().trim().min(2).max(200),
    slug: slugSchema,
    shortDescription : z.string().trim().min(1).max(300),
    description: z.string().min(1),
    image: projectImageSchema,
    technologies: z.array(z.string().trim().min(1).max(50)).max(20),
    githubUrl: z.string().url(),
    liveUrl: z.string().url(),
    category: z.string().trim().max(100),
    featured: z.boolean(),
    displayOrder : z.number().int().min(0),
});

export const createProjectSchema = projectFieldsSchema.extend({
    // Optional: when omitted the server derives a unique slug from the title.
    slug: slugSchema.optional(),
    image: projectImageSchema.optional(),
    technologies: projectFieldsSchema.shape.technologies.default([]),
    githubUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    category: projectFieldsSchema.shape.category.optional(),
    featured: z.boolean().default(false),
    displayOrder : projectFieldsSchema.shape.displayOrder.default(0),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export type createProjectInput = z.infer<typeof createProjectSchema>;
