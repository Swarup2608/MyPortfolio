import type {AnalyticsDateRange} from "./analytics-date.js";

export function getPreviousPeriod(range: AnalyticsDateRange): AnalyticsDateRange {
    const duration = range.endDate.getTime() - range.startDate.getTime();
    const previousEndDate = new Date(range.startDate.getTime());
    const previousStartDate = new Date(previousEndDate.getTime() - duration);
    return {
        startDate: previousStartDate,
        endDate: previousEndDate
    };
}