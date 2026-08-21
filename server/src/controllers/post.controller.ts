import type {Response} from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createPost,getPostById, getPosts, deletePost, updatePost, changePostStatus } from "../services/post.service.js";
import { createAuditLog } from "../services/audit.service.js";

type PostParams = {
  id: string;
};

// Create Post Controller
export async function createPostController(req: AuthenticatedRequest, res: Response): Promise<void>{
    const post = await createPost(req.body,req.user!.userId);
    await createAuditLog({ req,action: "CREATE",resource: "POST",resourceId: post._id.toString(),description: `Created post "${post.title}"`});
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
    await createAuditLog({ req,action: "UPDATE",resource: "POST",resourceId: post._id.toString(),description: `Updated post "${post.title}"`});
    res.status(200).json({success:true,data:post});
}

export async function deletePostController(req: AuthenticatedRequest & {params: PostParams}, res: Response) : Promise<void>{
    const post = await getPostById(req.params.id);
    if (!post) {
        res.status(404).json({success: false, message: "[post] Post not found"});
        return;
    }
    const postTitle = post.title;
    const postId = post._id.toString();
    await createAuditLog({
        req,
        action: "DELETE",
        resource: "POST",
        resourceId: postId,
        description: `Deleted post "${postTitle}"`,
    });
    await deletePost(req.params.id);
    res.status(200).json({success: true, message: "[post] Post deleted successfully"});
}

export async function changePostStautusController(req: AuthenticatedRequest & {params : PostParams}, res: Response) : Promise<void>{
    const post = await changePostStatus(req.params.id,req.body.status);
    await createAuditLog({ req,action: "UPDATE",resource: "POST",resourceId: post._id.toString(),description: `Changed status of post "${post.title}" to "${post.status}"`});
    res.status(200).json({success:true,data:post});
}