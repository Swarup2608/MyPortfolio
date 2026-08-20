import type {Request, Response} from 'express';
import {Project} from '../models/Project.model.js';
import {AppError} from '../utils/app-error.js';

export async function getPublishedProjects(_req: Request,res: Response): Promise<void>{
    const projects = await Project.find({
        status: "PUBLISHED",
    }).sort({publishedAt: -1}).select("title slug shortDescription description image technologies githubUrl liveUrl category featured displayOrder publishedAt").lean();
    res.status(200).json({success:true,data: projects});
}

export async function getPublishedProjectsBySlug(req: Request, res: Response) : Promise<void>{
    const project = await Project.findOne({
        slug: req.params.slug,
        status: "PUBLISHED",
    }).select("title slug shortDescription description image technologies githubUrl liveUrl category featured displayOrder publishedAt").populate("author","name").lean();
    if(!project){
        throw new AppError("[project] Project not found",404);
    }
    res.status(200).json({success:true,data: project});
}