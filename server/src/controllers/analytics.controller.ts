import type { Request, Response } from "express";
import { createAnalyticsEvent } from "../services/analytics.service.js";
import { AnalyticsEventInput } from "../schemas/analytics.schema.js";

export async function trackAnalyticsEvent(req:Request, res:Response): Promise<void> {
    const input = req.body as AnalyticsEventInput;
    const recorded = await createAnalyticsEvent({input, userAgent: req.get("User-Agent") || undefined});
    res.status(201).json({
        success: recorded,
        message: recorded ? "[analytics] Page view tracked successfully." : "[analytics] Duplicate page view detected. Skipping creation.",
    });
}