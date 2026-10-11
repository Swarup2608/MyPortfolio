import { z } from "zod";
import { ANALYTICS_EVENT_TYPES } from "../models/AnalyticsEvent.model.js";

export const trackEventSchema = z.object({
    type: z.enum(ANALYTICS_EVENT_TYPES),
    path: z.string().trim().startsWith("/", "[validation] Path must start with /").max(300),
    projectId: z.string().regex(/^[a-f\d]{24}$/i, "[validation] Invalid project id").optional(),
}).refine((event) => event.type === "PAGE_VIEW" || event.projectId, {
    message: "[validation] projectId is required for link clicks",
    path: ["projectId"],
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;

export const ANALYTICS_RANGES = ["7", "30", "90", "365"] as const;

function isValidTimeZone(timeZone: string){
    try {
        new Intl.DateTimeFormat("en-US", { timeZone });
        return true;
    } catch {
        return false;
    }
}

export const analyticsQuerySchema = z.object({
    range: z.enum(ANALYTICS_RANGES).default("30"),
    // IANA zone of the viewer, so "today" and the daily buckets match their calendar.
    tz: z.string().max(64).refine(isValidTimeZone, "[validation] Unknown time zone").default("UTC"),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
