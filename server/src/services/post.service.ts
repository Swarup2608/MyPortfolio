import { Post, type PostStatus } from "../models/Post.model.js";
import type { CreatePostInput } from "../schemas/post.schema.js";
import type { UpdatePostInput } from "../schemas/post-update.schema.js";
import type { AdminListQuery, PublicPostListQuery } from "../schemas/list-query.schema.js";
import { AppError } from "../utils/app-error.js";
import { validateObjectId } from "../utils/object-id.js";
import { paginate } from "../utils/pagination.js";
import { readingTime } from "../utils/reading-time.js";
import { slugify } from "../utils/slugify.js";

const PUBLIC_LIST_FIELDS = "title slug excerpt coverImage tags category publishedAt readingTimeInMinutes viewCount";

async function uniqueSlugFromTitle(title: string): Promise<string> {
    const base = slugify(title) || "post";
    let slug = base;
    for (let suffix = 2; await Post.exists({ slug }); suffix++) {
        slug = `${base}-${suffix}`;
    }
    return slug;
}

export async function createPost(input: CreatePostInput,authorId: string){
    let slug: string;
    if(input.slug){
        const existingPost = await Post.findOne({slug: input.slug});
        if(existingPost){
            throw new AppError("[post] A post with this slug already exists", 409);
        }
        slug = input.slug;
    }else{
        slug = await uniqueSlugFromTitle(input.title);
    }

    const post = await Post.create({
        ...input,
        slug,
        author: authorId,
        readingTimeInMinutes: readingTime(input.content),
        ...(input.status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
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

export async function getPosts({page, limit}: AdminListQuery){
    const [posts, total] = await Promise.all([
        Post.find().select("-content").populate("author","name email role").sort({createdAt: -1}).skip((page - 1) * limit).limit(limit).lean(),
        Post.countDocuments(),
    ]);
    return { posts, pagination: paginate(page, limit, total) };
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
    const { coverImage, ...fields } = input;
    Object.assign(post,fields);
    if(coverImage === null){
        post.coverImage = undefined;
    }else if(coverImage){
        post.coverImage = coverImage;
    }
    if(input.content !== undefined){
        post.readingTimeInMinutes = readingTime(input.content);
    }
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

export async function changePostStatus(postId: string, status: PostStatus){
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

export async function getPublishedPosts({page, limit, tag}: PublicPostListQuery){
    const filter: { status: PostStatus; tags?: string } = { status: "PUBLISHED", ...(tag ? { tags: tag } : {}) };
    const [posts, total] = await Promise.all([
        Post.find(filter).select(PUBLIC_LIST_FIELDS).sort({publishedAt: -1}).skip((page - 1) * limit).limit(limit).lean(),
        Post.countDocuments(filter),
    ]);
    return { posts, pagination: paginate(page, limit, total) };
}

export async function getPublishedTags(){
    const tags = await Post.distinct("tags", { status: "PUBLISHED" });
    return tags.sort();
}

// Each read of a published post counts as a view.
export async function getPublishedPostBySlug(slug: string){
    const post = await Post.findOneAndUpdate(
        { slug, status: "PUBLISHED" },
        { $inc: { viewCount: 1 } },
        { returnDocument: "after" },
    ).select(`${PUBLIC_LIST_FIELDS} content seo author`).populate("author","name").lean();
    if(!post){
        throw new AppError("[post] Post not found",404);
    }
    return post;
}
