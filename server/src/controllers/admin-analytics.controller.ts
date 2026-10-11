import type { Request, Response } from "express";

import { getAnalyticsDashboardData } from "../services/admin-analytics.service.js";

import { resolveAnalyticsDateRange } from "../utils/analytics-date.js";

import { adminAnalyticsSchema } from "../schemas/admin-analytics.schema.js";

export async function getAnalyticsDashboard(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = adminAnalyticsSchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      success: false,

      message: "Invalid analytics date range",

      errors: parsed.error.flatten().fieldErrors,
    });

    return;
  }

  const range = resolveAnalyticsDateRange(parsed.data);

  const data = await getAnalyticsDashboardData(range);

  res.status(200).json({
    success: true,

    data: {
      range: {
        startDate: range.startDate,

        endDate: range.endDate,
      },

      ...data,
    },
  });
}
