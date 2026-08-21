import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

import { AuditLog } from "../models/AuditLog.model.js";

export async function listAuditLogs(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const page = Math.max(
    Number(req.query.page) || 1,
    1
  );

  const limit = Math.min(
    Math.max(
      Number(req.query.limit) || 20,
      1
    ),
    100
  );

  const skip = (page - 1) * limit;

  const [logs, total] =
    await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      AuditLog.countDocuments(),
    ]);

  res.status(200).json({
    success: true,

    data: {
      logs,

      pagination: {
        page,
        limit,
        total,

        totalPages: Math.ceil(
          total / limit
        ),
      },
    },
  });
}