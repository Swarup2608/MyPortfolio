import {Project} from '../models/Project.model.js';
import type { createProjectInput } from '../schemas/project.schema.js';
import type { UpdateProjectInput } from '../schemas/project-update.schema.js';
import {AppError} from '../utils/app-error.js';
import { validateObjectId } from '../utils/object-id.js';
import { slugify } from '../utils/slugify.js';

async function uniqueSlugFromTitle(title: string): Promise<string> {
    const base = slugify(title) || "project";
    let slug = base;
    for (let suffix = 2; await Project.exists({ slug }); suffix++) {
        slug = `${base}-${suffix}`;
    }
    return slug;
}

export  async function createProject(input: createProjectInput){
    let slug: string;
    if(input.slug){
        const existingProject = await Project.findOne({slug: input.slug});
        if(existingProject){
            throw new AppError("[project] Project already exists with this slug", 409);
        }
        slug = input.slug;
    }else{
        slug = await uniqueSlugFromTitle(input.title);
    }
    return Project.create({
        ...input,
        slug,
        ...(input.status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
    });
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
    const { image, githubUrl, liveUrl, ...fields } = input;
    Object.assign(project, fields);
    // null removes the stored value; undefined leaves it unchanged.
    if(image !== undefined) project.image = image ?? undefined;
    if(githubUrl !== undefined) project.githubUrl = githubUrl ?? undefined;
    if(liveUrl !== undefined) project.liveUrl = liveUrl ?? undefined;
    await project.save();
    return project;
}

export async function deleteProject(projectId: string){
    validateObjectId(projectId);
    const project = await Project.findById(projectId);
    if(!project){
        throw new AppError("[project] Project Not Found",404);
    }
    await project.deleteOne();
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
