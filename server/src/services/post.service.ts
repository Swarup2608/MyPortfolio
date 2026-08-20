import { Post } from "../models/Post.model.js";
import type { CreatePostInput } from "../schemas/post.schema.js";
import type { UpdatePostInput } from "../schemas/post-update.schema.js";
import { AppError } from "../utils/app-error.js";
import { validateObjectId } from "../utils/object-id.js";

export async function createPost(input: CreatePostInput,authorId: string){
    const existingPost = await Post.findOne({slug: input.slug});
    if(existingPost){
        throw new AppError("A post with this slug already exists", 409);
    }
    // Map status spelling if needed by the mongoose model ('ARCHIEVED' typo in schema)
    const status = (input as any).status === 'ARCHIVED' ? 'ARCHIEVED' : (input as any).status;

    const post = await Post.create({
        ...input,
        author: authorId,
        ...(status !== undefined ? { status } : {}),
    } as any);
    return post;
}

export async function getPostById(postId: string){
    validateObjectId(postId);
    const post = await Post.findById(postId).populate("author","name email role");
    if(!post){
        throw new AppError("[post] Post not found ",404);
    }
    return post;
}

export async function getPosts(){
   return await Post.find().populate("author","name email role").sort({createdAt: -1});
}

export async function updatePost(postId: string, input:UpdatePostInput){
    validateObjectId(postId);
    const post = await Post.findById(postId);
    if(!post){
        throw new AppError("[post] Post not found",404);
    }
    if(input.slug && input.slug !== post.slug){
        const existingPost = await Post.findOne({slug: input.slug,_id:{$ne:postId},});
        if(existingPost){
            throw new AppError("[post] A post with this slug already exists",409);
        }
    }
    Object.assign(post,input);
    await post.save();
    return post;
}

export async function deletePost(postId: string){
    validateObjectId(postId);
    const post = await Post.findById(postId);
    if(!post){
        throw new AppError("[post] Post not found",404);
    }
    await post.deleteOne();
}

export async function changePostStatus(postId: string, status: "PUBLISHED" | "DRAFT" | "ARCHIEVED"){
    validateObjectId(postId);
    const post = await Post.findById(postId);
    if(!post){
        throw new AppError("[post] Post not found",404);
    }
    post.status = status;
    if(status == "PUBLISHED"){
        if(!post.publishedAt){
            post.publishedAt = new Date();
        }
    }else{
        post.publishedAt = undefined;
    }

    await post.save();
    return post;
}