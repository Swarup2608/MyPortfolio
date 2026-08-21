import {z} from "zod";

export const adminAnalyticsSchema = z.object({
  range: z.enum(["7d", "30d", "90d", "1y","custom"]).default("30d"),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});

export type AdminAnalyticsInput = z.infer<typeof adminAnalyticsSchema>;