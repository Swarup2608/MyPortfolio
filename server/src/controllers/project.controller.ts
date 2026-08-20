import type {Response} from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {createProject, getProjects, getProjectById, updateProject, deleteProject, changeProjectStatus} from '../services/project.service.js';

export async function  createProjectController(_req: AuthenticatedRequest,res: Response) : Promise<void>{
    const project  = await createProject(_req.body);
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
    res.status(200).json({success: true,data: project});
}

export async function deleteProjectController(_req: AuthenticatedRequest & {params: {id: string;};},res: Response): Promise<void>{
    await deleteProject(_req.params.id);
    res.status(200).json({success: true,message: "[project] Project successfully deleted"});
}

export async function changeProjectStatusController(_req: AuthenticatedRequest & {params: {id: string;};},res: Response): Promise<void>{
    const project = await changeProjectStatus(_req.params.id, _req.body.status)
    res.status(200).json({success: true,data: project});
}