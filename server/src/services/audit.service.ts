import { AuditLog } from "../models/AuditLog.model.js";
import type { AuditAction } from "../models/AuditLog.model.js";
import { User } from "../models/User.model.js";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

import { hashIp } from "../utils/hash.js";

interface CreateAuditLogInput {
  req?: AuthenticatedRequest;

  userId?: string;

  action: AuditAction;

  resource: string;

  resourceId?: string;

  description: string;

  metadata?: Record<string, unknown>;
}

export async function createAuditLog({
  req,
  userId,
  action,
  resource,
  resourceId,
  description,
  metadata,
}: CreateAuditLogInput): Promise<void> {
  const resolvedUserId = userId ?? req?.user?.userId;

  // Denormalize name/email onto the log entry so it stays readable even if
  // the user is later renamed or deleted — the audit trail shouldn't depend
  // on a live join back to the users collection.
  const actor = resolvedUserId
    ? await User.findById(resolvedUserId).select("name email").lean()
    : null;

  await AuditLog.create({
    userId: resolvedUserId,

    userName: actor?.name,

    userEmail: actor?.email,

    action,

    resource,

    resourceId,

    description,

    metadata,

    ipHash: hashIp(req?.ip),

    userAgent: req?.get("user-agent"),
  });
}
