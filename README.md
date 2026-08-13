# MyPortfolio

Personal portfolio + blog, built as a real full-stack app:

- **frontend/** — Next.js (App Router, TypeScript, Tailwind CSS)
- **backend/** — Express + MongoDB (Mongoose) REST API

Public pages (home, projects, blog) are server-rendered. The `/admin` area is
a small CMS for writing and publishing blog posts, backed by JWT cookie auth.

## Prerequisites

- Node.js 18+
- A MongoDB connection string (MongoDB Atlas recommended — free tier works).

## First-time setup

```bash
npm install                       # installs both workspaces from the root
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit `backend/.env`:

- Set `MONGODB_URI` to your MongoDB Atlas (or other MongoDB) connection string.
- Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` to whatever you want your admin login to be.
- Set `JWT_SECRET` to a random string:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then seed the database (creates your admin user + a couple of sample blog posts):

```bash
npm run seed
```

Now start both apps:

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Admin login: http://localhost:3000/admin/login

## Image storage

Uploaded images (blog cover images, inline images) go to local disk under
`backend/uploads/` by default and are served at `/uploads/...`. To switch to
Cloudflare R2 in production, set in `backend/.env`:

```
STORAGE_DRIVER=r2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
R2_PUBLIC_URL=https://your-bucket-public-url
```

No code changes needed — the storage layer is abstracted behind
`backend/src/services/storage`.

## Editing portfolio content

The About/Skills/Projects sections are placeholder content meant to be
edited directly (they don't need a CMS): see
`frontend/src/lib/siteConfig.ts`.

Blog posts are fully database-backed and managed from `/admin`.

## Security notes

- JWT stored in an httpOnly cookie; a second, readable `csrfToken` cookie
  implements the double-submit CSRF pattern for admin mutations.
- Rate limiting on login, contact form, and uploads.
- Input validation (zod) on every endpoint; `express-mongo-sanitize` strips
  Mongo operator injection from input.
- Blog content is Markdown, sanitized again at render time (defense in
  depth even though only the admin account can author it).
- Uploaded files are restricted by mimetype/size and stored under
  randomized names.
- See `backend/.env.example` for the cookie/CORS settings you need to
  adjust when deploying frontend and backend to different domains
  (`COOKIE_SAMESITE=none`, `COOKIE_SECURE=true`, HTTPS everywhere).

## Deploying later

- Frontend → Vercel (set `NEXT_PUBLIC_API_URL` to your deployed backend).
- Backend → any Node host; set `MONGODB_URI` (Atlas), `FRONTEND_URL`,
  `JWT_SECRET`, and the R2 storage variables.
