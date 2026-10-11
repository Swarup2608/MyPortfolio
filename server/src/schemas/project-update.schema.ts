import { z } from "zod";
import { projectFieldsSchema, projectImageSchema } from "./project.schema.js";

export const updateProjectSchema =
  projectFieldsSchema.partial().extend({
    // null removes the stored value.
    image: projectImageSchema.nullable().optional(),
    githubUrl: z.string().url().nullable().optional(),
    liveUrl: z.string().url().nullable().optional(),
  });

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
