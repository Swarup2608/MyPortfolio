import {z} from 'zod';

export const publishPostSchema = z.object(
    {status: z.enum(["PUBLISHED","DRAFT","ARCHIVED"])}
);

export type PublishPostInput = z.infer<typeof publishPostSchema>