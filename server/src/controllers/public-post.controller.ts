import type {Request, Response} from 'express';
import {Post} from '../models/Post.model.js';
import {AppError} from '../utils/app-error.js';

export async function getPublishedPosts(_req: Request,res: Response): Promise<void>{
    const posts = await Post.find({
        status: "PUBLISHED",
    }).sort({publishedAt: -1}).select("title slug excerpt coverImage tags category publishedAt readingTimeMinutes viewCount").lean();
    res.status(200).json({success:true,data:posts});
}

export async function getPublishedPostsBySlug(req: Request, res: Response) : Promise<void>{
    const post = await Post.findOne({
        slug: req.params.slug,
        status: "PUBLISHED",
    }).select("title slug excerpt coverImage tags category publishedAt readingTimeMinutes viewCount seo author").populate("author","name").lean();
    if(!post){
        throw new AppError("[post] Post not found",404);
    }
    res.status(200).json({success:true,data:post});
}