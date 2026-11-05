import { z } from "zod";
import { FILE_KEY_PATTERN } from "../services/storage/common.js";

export const deleteMediaSchema = z.object({
    keys: z.array(z.string().regex(FILE_KEY_PATTERN)).min(1).max(50),
});

export type DeleteMediaInput = z.infer<typeof deleteMediaSchema>;
