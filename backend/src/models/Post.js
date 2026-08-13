import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    excerpt: { type: String, trim: true, maxlength: 400 },
    content: { type: String, required: true }, // Markdown source
    coverImage: { type: String, default: '' }, // URL
    tags: [{ type: String, trim: true, lowercase: true }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date, default: null },
    readingTimeMinutes: { type: Number, default: 1 },
    views: { type: Number, default: 0 },
    seoTitle: { type: String, trim: true, maxlength: 200 },
    seoDescription: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });

export default mongoose.model('Post', postSchema);
