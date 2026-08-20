import { z } from "zod";
import { createProjectSchema } from "./project.schema.js";

export const updateProjectSchema = createProjectSchema.partial();

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;