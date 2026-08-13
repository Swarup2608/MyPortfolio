import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Post from '../models/Post.js';
import slugify from '../utils/slugify.js';
import readingTime from '../utils/readingTime.js';

async function uniqueSlug(title, excludeId) {
  const base = slugify(title) || 'post';
  let slug = base;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await Post.findOne({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (!existing) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

const PUBLIC_LIST_FIELDS =
  'title slug excerpt coverImage tags publishedAt readingTimeMinutes';

// --- Public ---

export const listPublished = asyncHandler(async (req, res) => {
  const { page, limit, tag } = req.query;
  const filter = { status: 'published', ...(tag ? { tags: tag } : {}) };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .select(PUBLIC_LIST_FIELDS)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  res.json({
    success: true,
    posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getPublishedBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { slug: req.params.slug, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('author', 'name');

  if (!post) throw new ApiError(404, 'Post not found');
  res.json({ success: true, post });
});

export const listTags = asyncHandler(async (_req, res) => {
  const tags = await Post.distinct('tags', { status: 'published' });
  res.json({ success: true, tags: tags.sort() });
});

// --- Admin ---

export const listAll = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const [posts, total] = await Promise.all([
    Post.find({})
      .select(`${PUBLIC_LIST_FIELDS} status views createdAt updatedAt`)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Post.countDocuments({}),
  ]);

  res.json({
    success: true,
    posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found');
  res.json({ success: true, post });
});

export const create = asyncHandler(async (req, res) => {
  const slug = await uniqueSlug(req.body.title);

  const post = await Post.create({
    ...req.body,
    slug,
    author: req.user._id,
    readingTimeMinutes: readingTime(req.body.content),
    publishedAt: req.body.status === 'published' ? new Date() : null,
  });

  res.status(201).json({ success: true, post });
});

export const update = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found');

  const updates = { ...req.body };

  if (updates.title && updates.title !== post.title) {
    updates.slug = await uniqueSlug(updates.title, post._id);
  }
  if (updates.content) {
    updates.readingTimeMinutes = readingTime(updates.content);
  }
  if (updates.status === 'published' && post.status !== 'published') {
    updates.publishedAt = new Date();
  }
  if (updates.status === 'draft') {
    updates.publishedAt = null;
  }

  Object.assign(post, updates);
  await post.save();

  res.json({ success: true, post });
});

export const remove = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found');
  res.json({ success: true });
});
