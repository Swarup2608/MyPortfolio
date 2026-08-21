import { Post } from "../models/Post.model.js";
import type { CreatePostInput } from "../schemas/post.schema.js";
import type { UpdatePostInput } from "../schemas/post-update.schema.js";
import { AppError } from "../utils/app-error.js";
import { validateObjectId } from "../utils/object-id.js";
import { calculateReadingTime } from "../utils/reading-time.js";
import { deleteImageIfUnused } from "./storage.service.js";

// R2 cleanup must never break the request that triggered it — the DB write
// already succeeded, so a storage hiccup should just leave an orphaned file
// for later cleanup rather than surface as a failure to the caller.
async function cleanupOldImage(oldKey?: string, newKey?: string) {
    if (!oldKey || oldKey === newKey) return;
    try {
        await deleteImageIfUnused(oldKey);
    } catch (error) {
        console.error(`[post] Failed to clean up old cover image "${oldKey}":`, error);
    }
}

export async function createPost(input: CreatePostInput,authorId: string){
    const existingPost = await Post.findOne({slug: input.slug});
    if(existingPost){
        throw new AppError("A post with this slug already exists", 409);
    }

    const post = await Post.create({
        ...input,
        author: authorId,
        readingTimeInMinutes: calculateReadingTime(input.content),
    });
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
    const previousCoverImageKey = post.coverImage?.key;
    Object.assign(post,input);
    if(input.content !== undefined){
        post.readingTimeInMinutes = calculateReadingTime(input.content);
    }
    await post.save();

    await cleanupOldImage(previousCoverImageKey, post.coverImage?.key);

    return post;
}

export async function deletePost(postId: string){
    validateObjectId(postId);
    const post = await Post.findById(postId);
    if(!post){
        throw new AppError("[post] Post not found",404);
    }
    const coverImageKey = post.coverImage?.key;
    await post.deleteOne();

    await cleanupOldImage(coverImageKey, undefined);
}

export async function changePostStatus(postId: string, status: "PUBLISHED" | "DRAFT" | "ARCHIVED"){
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