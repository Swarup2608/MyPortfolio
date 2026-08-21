import type {Request, Response} from 'express';
import {Project} from '../models/Project.model.js';
import {AppError} from '../utils/app-error.js';

const PUBLIC_PROJECT_FIELDS =
    "title slug shortDescription description image technologies githubUrl liveUrl category featured displayOrder publishedAt";

export async function getPublishedProjects(_req: Request,res: Response): Promise<void>{
    const projects = await Project.find({
        status: "PUBLISHED",
    }).sort({displayOrder: 1, publishedAt: -1}).select(PUBLIC_PROJECT_FIELDS).lean();
    res.status(200).json({success:true,data: projects});
}

export async function getPublishedProjectsBySlug(req: Request, res: Response) : Promise<void>{
    const project = await Project.findOne({
        slug: req.params.slug,
        status: "PUBLISHED",
    }).select(PUBLIC_PROJECT_FIELDS).lean();
    if(!project){
        throw new AppError("[project] Project not found",404);
    }
    res.status(200).json({success:true,data: project});
}
