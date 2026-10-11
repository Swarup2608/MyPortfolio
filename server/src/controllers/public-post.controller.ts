import type {Request, Response} from 'express';
import type { PublicPostListQuery } from '../schemas/list-query.schema.js';
import { getPublishedPostBySlug, getPublishedPosts, getPublishedTags } from '../services/post.service.js';

export async function getPublishedPostsController(_req: Request,res: Response): Promise<void>{
    const { posts, pagination } = await getPublishedPosts(res.locals.query as PublicPostListQuery);
    res.status(200).json({success:true,data:posts,pagination});
}

export async function getPublishedTagsController(_req: Request,res: Response): Promise<void>{
    const tags = await getPublishedTags();
    res.status(200).json({success:true,data:tags});
}

export async function getPublishedPostsBySlug(req: Request<{slug: string}>, res: Response) : Promise<void>{
    const post = await getPublishedPostBySlug(req.params.slug);
    res.status(200).json({success:true,data:post});
}
