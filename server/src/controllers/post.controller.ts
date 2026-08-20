import type {Response} from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createPost,getPostById, getPosts, deletePost, updatePost, changePostStatus } from "../services/post.service.js";

type PostParams = {
  id: string;
};

// Create Post Controller
export async function createPostController(req: AuthenticatedRequest, res: Response): Promise<void>{
    const post = await createPost(req.body,req.user!.userId);
    res.status(201).json({success:true, data:post});
}

export async function getPostsController(req:AuthenticatedRequest,res:Response) : Promise<void> {
    const posts = await getPosts();
    res.status(200).json({success:true,data:posts,});
}

export async function getPostController(req: AuthenticatedRequest & {params: PostParams}, res: Response) : Promise<void>{
    const post = await getPostById(req.params.id);
    res.status(200).json({success:true,data:post});
}

export async function updatePostController(req: AuthenticatedRequest & {params: PostParams}, res: Response) : Promise<void>{
    const post = await updatePost(req.params.id, req.body);
    res.status(200).json({success:true,data:post});
}

export async function deletePostController(req: AuthenticatedRequest & {params: PostParams}, res: Response) : Promise<void>{
    await deletePost(req.params.id);
    res.status(200).json({success: true, message: "[post] Post deleted successfully"});
}

export async function changePostStautusController(req: AuthenticatedRequest & {params : PostParams}, res: Response) : Promise<void>{
    const post = await changePostStatus(req.params.id,req.body.status);
    res.status(200).json({success:true,data:post});
}