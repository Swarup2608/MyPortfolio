import type {Request, Response} from 'express';
import {Post} from '../models/Post.model.js';
import {AppError} from '../utils/app-error.js';

const PUBLIC_LIST_FIELDS =
    "title slug excerpt coverImage tags category publishedAt readingTimeInMinutes viewCount createdAt updatedAt";

const PUBLIC_DETAIL_FIELDS =
    "title slug excerpt content coverImage tags category publishedAt readingTimeInMinutes viewCount seo author createdAt updatedAt";

interface LeanPost {
    _id: unknown;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    coverImage?: { url?: string; key?: string; alt?: string };
    tags?: string[];
    category?: string;
    author?: unknown;
    publishedAt?: Date;
    readingTimeInMinutes?: number;
    viewCount?: number;
    seo?: { title?: string; description?: string; keywords?: string[] };
    createdAt?: Date;
    updatedAt?: Date;
}

// Shapes a post document for public consumption: flattens coverImage to a URL,
// and aliases the internal field names (readingTimeInMinutes/viewCount) to the
// public contract (readingTimeMinutes/views).
function serializePost(post: LeanPost) {
    return {
        _id: post._id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        ...(post.content !== undefined ? { content: post.content } : {}),
        coverImage: post.coverImage?.url ?? "",
        tags: post.tags ?? [],
        category: post.category,
        status: "PUBLISHED",
        author: post.author,
        publishedAt: post.publishedAt,
        readingTimeMinutes: post.readingTimeInMinutes,
        views: post.viewCount,
        ...(post.seo
            ? { seoTitle: post.seo.title, seoDescription: post.seo.description, seoKeywords: post.seo.keywords ?? [] }
            : {}),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    };
}

export async function getPublishedPosts(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10));
    const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;

    const filter: Record<string, unknown> = { status: "PUBLISHED" };
    if (tag) filter.tags = tag;

    const [posts, total] = await Promise.all([
        Post.find(filter)
            .select(PUBLIC_LIST_FIELDS)
            .sort({ publishedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Post.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        posts: posts.map(serializePost),
        pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
}

export async function getPublishedPostsBySlug(req: Request, res: Response): Promise<void> {
    const post = await Post.findOne({
        slug: req.params.slug,
        status: "PUBLISHED",
    }).select(PUBLIC_DETAIL_FIELDS).populate("author", "name").lean();

    if (!post) {
        throw new AppError("[post] Post not found", 404);
    }
    res.status(200).json({ success: true, post: serializePost(post) });
}

export async function getPublishedPostTags(_req: Request, res: Response): Promise<void> {
    const tags = await Post.distinct("tags", { status: "PUBLISHED" });
    res.status(200).json({ success: true, tags: tags.sort() });
}
