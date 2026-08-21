import { z } from "zod";
import { createProjectSchema } from "./project.schema.js";

// .partial() alone doesn't strip the base schema's .default(...) — Zod still
// injects the default for any omitted key, which would silently reset
// technologies/featured/displayOrder to their defaults on every partial
// update that doesn't happen to touch them. Redefine those three without
// defaults so an omitted key stays omitted (and the existing value survives
// the Object.assign in project.service.ts).
export const updateProjectSchema = createProjectSchema
  .omit({ technologies: true, featured: true, displayOrder: true })
  .partial()
  .extend({
    technologies: z.array(z.string().trim().min(1).max(50)).optional(),
    featured: z.boolean().optional(),
    displayOrder: z.number().int().min(0).optional(),
  });

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;