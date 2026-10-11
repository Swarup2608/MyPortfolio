import {Router} from 'express';
import { createProjectController, getProjectsByIdController, getProjectsController, updateProjectController, deleteProjectController, changeProjectStatusController  } from '../controllers/project.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { requireCsrf } from '../middleware/csrf.middleware.js';
import { PERMISSIONS } from '../config/permissions.js';
import { asyncHandler } from '../utils/async-handler.js';
import { createProjectSchema } from '../schemas/project.schema.js';
import { projectStatusSchema } from '../schemas/project-status.schema.js';
import { updateProjectSchema } from '../schemas/project-update.schema.js';

const projectRoutes = Router();

projectRoutes.use(requireAuth);

// Get All Projects
projectRoutes.get("/",requirePermission(PERMISSIONS.PROJECTS_READ),getProjectsController);

// Get Project by Id
projectRoutes.get("/:id",requirePermission(PERMISSIONS.PROJECTS_READ),getProjectsByIdController);

// Create Project
projectRoutes.post("/",requirePermission(PERMISSIONS.PROJECTS_CREATE),requireCsrf,validateBody(createProjectSchema),asyncHandler(createProjectController));

// Update Project
projectRoutes.patch("/:id",requirePermission(PERMISSIONS.PROJECTS_UPDATE),requireCsrf,validateBody(updateProjectSchema),updateProjectController);

// Delete Project
projectRoutes.delete("/:id",requirePermission(PERMISSIONS.PROJECTS_DELETE),requireCsrf,deleteProjectController);

// Change Project Status
projectRoutes.patch("/:id/status",requirePermission(PERMISSIONS.PROJECTS_PUBLISH),requireCsrf,validateBody(projectStatusSchema),asyncHandler(changeProjectStatusController));

export default projectRoutes;