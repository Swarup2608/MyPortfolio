import { Router } from "express";

import {
  listAuditLogs,
} from "../controllers/admin-audit.controller.js";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import {
  requirePermission,
} from "../middleware/permission.middleware.js";

import {PERMISSIONS} from "../config/permissions.js";
import {
  asyncHandler,
} from "../utils/async-handler.js";

const router = Router();

router.get(
  "/",

  requireAuth,

  requirePermission(
    PERMISSIONS.AUDIT_LOG_READ
  ),

  asyncHandler(listAuditLogs)
);

export default router;