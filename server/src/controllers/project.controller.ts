import type {Response} from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {createProject, getProjects, getProjectById, updateProject, deleteProject, changeProjectStatus} from '../services/project.service.js';
import { createAuditLog } from '../services/audit.service.js';

export async function  createProjectController(_req: AuthenticatedRequest,res: Response) : Promise<void>{
    const project  = await createProject(_req.body);
    await createAuditLog({ req: _req, action: "CREATE", resource: "PROJECT", resourceId: project._id.toString(), description: `Created project "${project.title}"`});
    res.status(201).json({success: true, data: project});
}

export async  function getProjectsController(_req: AuthenticatedRequest, res: Response) : Promise<void> {
    const projects = await getProjects();
    res.status(200).json({success: true, data: projects});
}

export async function getProjectsByIdController(_req: AuthenticatedRequest &  {params: {id: string;};},res: Response): Promise<void>{
    const project = await getProjectById(_req.params.id);
    res.status(200).json({success:true, data: project});
}

export async function updateProjectController(_req: AuthenticatedRequest & {params: {id: string;};},res: Response): Promise<void>{
    const project = await updateProject(_req.params.id,_req.body);
    await createAuditLog({ req: _req, action: "UPDATE", resource: "PROJECT", resourceId: project._id.toString(), description: `Updated project "${project.title}"`});
    res.status(200).json({success: true,data: project});
}

export async function deleteProjectController(_req: AuthenticatedRequest & {params: {id: string;};},res: Response): Promise<void>{
    const project = await getProjectById(_req.params.id);
    if (!project) {
        res.status(404).json({success: false, message: "[project] Project not found"});
        return;
    }
    const projectTitle = project?.title;
    const projectId = project?._id.toString();
    await createAuditLog({
        req: _req,
        action: "DELETE",
        resource: "PROJECT",
        resourceId: projectId,
        description: `Deleted project "${projectTitle}"`,
    });
    await deleteProject(_req.params.id);
    res.status(200).json({success: true,message: "[project] Project successfully deleted"});
}

export async function changeProjectStatusController(_req: AuthenticatedRequest & {params: {id: string;};},res: Response): Promise<void>{
    const project = await changeProjectStatus(_req.params.id, _req.body.status);
    await createAuditLog({ req: _req, action: "UPDATE", resource: "PROJECT", resourceId: project._id.toString(), description: `Changed status of project "${project.title}" to "${project.status}"`});
    res.status(200).json({success: true,data: project});
}