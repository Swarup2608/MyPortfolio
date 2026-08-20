import { Router } from "express";
import { getContactByIdController, getContactsController, updateContactStatusController } from "../controllers/admin-contact.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";
import { requirePermission } from "../middleware/permission.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(requireAuth);
router.get("/",requirePermission(PERMISSIONS.CONTACTS_READ),asyncHandler(getContactsController));
router.get("/:id",requirePermission(PERMISSIONS.CONTACTS_READ),asyncHandler(getContactByIdController));
router.patch("/:id",requirePermission(PERMISSIONS.CONTACTS_UPDATE),asyncHandler(updateContactStatusController));


export default router;