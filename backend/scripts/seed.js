import 'dotenv/config';
import { connectDB, disconnectDB } from '../src/config/db.js';
import env from '../src/config/env.js';
import User from '../src/models/User.js';
import Post from '../src/models/Post.js';
import slugify from '../src/utils/slugify.js';
import readingTime from '../src/utils/readingTime.js';

const SAMPLE_POSTS = [
  {
    title: 'Welcome to my blog',
    excerpt: 'The first post on this site — a quick note on what to expect here.',
    tags: ['meta'],
    status: 'published',
    content: `# Welcome\n\nThis is a placeholder post seeded automatically. Replace it with real writing any time from **/admin**.\n\n## What to expect\n\n- Notes on projects I'm building\n- Things I learn along the way\n- Occasional deep dives into tools I use\n\nThanks for stopping by.`,
  },
  {
    title: 'How this site is built',
    excerpt: 'A short look at the stack behind this portfolio and blog.',
    tags: ['engineering', 'meta'],
    status: 'published',
    content: `# How this site is built\n\nThis site runs on:\n\n- **Next.js** for the frontend\n- **Express + MongoDB** for the API and data\n- A pluggable storage layer for images (local disk in dev, Cloudflare R2 in production)\n\nMore technical write-ups coming soon.`,
  },
  {
    title: 'Draft: work in progress post',
    excerpt: 'This one is still a draft and will not show up on the public blog.',
    tags: ['meta'],
    status: 'draft',
    content: `# Work in progress\n\nThis draft is only visible from the admin dashboard until it is published.`,
  },
];

async function seed() {
  await connectDB();

  let admin = await User.findOne({ email: env.adminEmail.toLowerCase() });
  if (!admin) {
    if (!env.adminPassword) {
      throw new Error('Set ADMIN_PASSWORD in backend/.env before seeding');
    }
    admin = await User.create({
      name: env.adminName,
      email: env.adminEmail.toLowerCase(),
      passwordHash: await User.hashPassword(env.adminPassword),
    });
    console.log(`[seed] Created admin user: ${admin.email}`);
  } else {
    console.log(`[seed] Admin user already exists: ${admin.email}`);
  }

  for (const sample of SAMPLE_POSTS) {
    const slug = slugify(sample.title);
    const exists = await Post.findOne({ slug });
    if (exists) {
      console.log(`[seed] Post already exists, skipping: ${slug}`);
      continue;
    }
    await Post.create({
      ...sample,
      slug,
      author: admin._id,
      readingTimeMinutes: readingTime(sample.content),
      publishedAt: sample.status === 'published' ? new Date() : null,
    });
    console.log(`[seed] Created post: ${slug}`);
  }

  console.log('[seed] Done.');
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
