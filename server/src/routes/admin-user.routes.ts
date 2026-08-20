import { Router } from "express";

import { getUserByIDController, getUsersController, createAdminUser, updateAdminUser, updateAdminUserStatus, updateAdminUserPassword } from "../controllers/admin-user.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { PERMISSIONS } from "../config/permissions.js";
import { createUserSchema } from "../schemas/user.schema.js";
import { updateUserSchema } from "../schemas/user-update.schema.js";
import { updateUserStatusSchema } from "../schemas/user-status.schema.js";
import { updateUserPasswordSchema } from "../schemas/user-password.schema.js";

const router = Router();

router.use(requireAuth);

router.get( "/", requirePermission(PERMISSIONS.USERS_READ), asyncHandler(getUsersController));

router.get( "/:id", requirePermission(PERMISSIONS.USERS_READ),  asyncHandler(getUserByIDController));

router.post( "/", requirePermission(PERMISSIONS.USERS_CREATE), validateBody(createUserSchema), asyncHandler(createAdminUser));

router.patch( "/:id", requirePermission(PERMISSIONS.USERS_UPDATE), validateBody(updateUserSchema),asyncHandler(updateAdminUser));

router.patch( "/:id/status", requirePermission(PERMISSIONS.USERS_UPDATE), validateBody(updateUserStatusSchema), asyncHandler(updateAdminUserStatus));

router.patch( "/:id/password", requirePermission(PERMISSIONS.USERS_UPDATE), validateBody(updateUserPasswordSchema), asyncHandler(updateAdminUserPassword));

export default router;