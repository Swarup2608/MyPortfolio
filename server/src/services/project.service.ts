import {Project} from '../models/Project.model.js';
import type { createProjectInput } from '../schemas/project.schema.js';
import type { UpdateProjectInput } from '../schemas/project-update.schema.js';
import {AppError} from '../utils/app-error.js';
import { validateObjectId } from '../utils/object-id.js';
import { deleteImageIfUnused } from './storage.service.js';

// R2 cleanup must never break the request that triggered it — the DB write
// already succeeded, so a storage hiccup should just leave an orphaned file
// for later cleanup rather than surface as a failure to the caller.
async function cleanupOldImage(oldKey?: string, newKey?: string) {
    if (!oldKey || oldKey === newKey) return;
    try {
        await deleteImageIfUnused(oldKey);
    } catch (error) {
        console.error(`[project] Failed to clean up old image "${oldKey}":`, error);
    }
}

export  async function createProject(input: createProjectInput){
    const existingProject = await Project.findOne({slug: input.slug});
    if(existingProject){
        throw new AppError("[project] Project already exists with this slug", 409);
    }
    return Project.create({...input, status: "DRAFT"});
}

export async function getProjects(){
    return Project.find().sort({displayOrder: 1, createdAt: -1}).lean();
}

export async function getProjectById(projectId: string){
    validateObjectId(projectId);
    const project = await Project.findById(projectId).lean();
    if(!project){
        throw new AppError("[project] Project not found",404);
    }
    return project;
}

export async function updateProject(projectId: string, input: UpdateProjectInput){
    validateObjectId(projectId);
    const project = await Project.findById(projectId);
    if(!project){
        throw new AppError("[project] Project not found",404);
    }
    if(input.slug && input.slug !== project.slug){
        const existingProject = await Project.findOne({slug: input.slug, _id: {$ne: projectId}});
        if(existingProject){
            throw new AppError("[project] Project with this slug already exists",409);
        }
    }
    const previousImageKey = project.image?.key;
    Object.assign(project, input);
    await project.save();

    await cleanupOldImage(previousImageKey, project.image?.key);

    return project;
}

export async function deleteProject(projectId: string){
    validateObjectId(projectId);
    const project = await Project.findById(projectId);
    if(!project){
        throw new AppError("[project] Project Not Found",404);
    }
    const imageKey = project.image?.key;
    await project.deleteOne();

    await cleanupOldImage(imageKey, undefined);
}

export async function changeProjectStatus(projectId: string, projectStatus: "PUBLISHED" | "DRAFT" | "ARCHIVED"){
    validateObjectId(projectId);
    const project = await Project.findById(projectId);
    if(!project){
        throw new AppError("[project] Project Not Found",404);
    }
    project.status = projectStatus;
    if(projectStatus == "PUBLISHED"){
        if(!project.publishedAt){
            project.publishedAt = new Date();
        }
    }
    else{
        project.publishedAt = undefined;
    }
    await project.save();
    return project;
}