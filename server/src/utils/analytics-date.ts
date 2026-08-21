import type {AdminAnalyticsInput} from "../schemas/admin-analytics.schema.js";

export interface AnalyticsDateRange {
  startDate: Date;
  endDate: Date;
}

export function resolveAnalyticsDateRange(input: AdminAnalyticsInput): AnalyticsDateRange {
    const now = new Date();
    if(input.range === "custom") {
        if(!input.startDate || !input.endDate) {
            throw new Error("[validation] Custom range requires both startDate and endDate");
        }
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        if(startDate > endDate) {
            throw new Error("[validation] startDate cannot be after endDate");
        }
        return {startDate, endDate};
    }
    switch(input.range) {
        case "7d":
            return {
                startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
                endDate: now,
            };
        case "30d":
            return {
                startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30),
                endDate: now,
            };
        case "90d":
            return {
                startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90),
                endDate: now,
            };
        case "1y":
            return {
                startDate: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
                endDate: now,
            };
        default:
            throw new Error(`[validation] Unknown range: ${input.range}`);
    }
}