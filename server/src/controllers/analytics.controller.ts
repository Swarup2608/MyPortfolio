import type {Request, Response} from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import type { AnalyticsQuery, TrackEventInput } from "../schemas/analytics.schema.js";
import { getAnalyticsSummary, trackEvent } from "../services/analytics.service.js";

// Crawlers and headless browsers would otherwise inflate the numbers.
const BOT_PATTERN = /bot|crawl|spider|slurp|headless|lighthouse/i;

export async function trackEventController(_req: Request, res: Response): Promise<void>{
    const userAgent = _req.get("user-agent") ?? "";
    if(userAgent && !BOT_PATTERN.test(userAgent)){
        await trackEvent(_req.body as TrackEventInput, {ip: _req.ip || "unknown", userAgent});
    }
    res.status(204).end();
}

export async function getAnalyticsSummaryController(_req: AuthenticatedRequest, res: Response): Promise<void>{
    const summary = await getAnalyticsSummary(res.locals.query as AnalyticsQuery);
    res.status(200).json({success: true, data: summary});
}
