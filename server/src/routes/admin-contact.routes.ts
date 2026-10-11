import { Router } from "express";
import { deleteContactController, getContactByIdController, getContactsController, updateContactStatusController } from "../controllers/admin-contact.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireCsrf } from "../middleware/csrf.middleware.js";
import { validateBody, validateQuery } from "../middleware/validate.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";
import { requirePermission } from "../middleware/permission.middleware.js";
import { contactStatusSchema } from "../schemas/contact-status.schema.js";
import { adminListQuerySchema } from "../schemas/list-query.schema.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(requireAuth);
router.get("/",requirePermission(PERMISSIONS.CONTACTS_READ),validateQuery(adminListQuerySchema),asyncHandler(getContactsController));
router.get("/:id",requirePermission(PERMISSIONS.CONTACTS_READ),asyncHandler(getContactByIdController));
router.patch("/:id",requirePermission(PERMISSIONS.CONTACTS_UPDATE),requireCsrf,validateBody(contactStatusSchema),asyncHandler(updateContactStatusController));
router.delete("/:id",requirePermission(PERMISSIONS.CONTACTS_DELETE),requireCsrf,asyncHandler(deleteContactController));


export default router;
