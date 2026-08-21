import {z} from "zod";

export const analyticsEventSchema = z.object({
    path: z.string().trim().max(500).min(1),
    visitorId: z.string().uuid(),
    sessionId: z.string().uuid().optional(),
    referrer: z.string().max(1000).trim().optional(),
    postId: z.string().regex(/^[a-f\d]{24}$/i, "[validation] Invalid PostId").optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;