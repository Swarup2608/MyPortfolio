# MyPortfolio

A full-stack personal portfolio, blog, and admin CMS — built as two
independently deployable apps in an npm workspaces monorepo:

- **`frontend/`** — Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **`server/`** — Express 5 + MongoDB (Mongoose) REST API in TypeScript

Public pages (home, about, projects, blog) are server-rendered by Next.js and
read from the API. The `/admin` area is a small CMS for writing/publishing
blog posts and reading contact form submissions, gated behind JWT cookie
auth with role-based permissions. A `/coming-soon` page and a site-wide
maintenance flag are also built in.

---

## Tech stack

### Frontend

| Concern           | Choice                                                |
| ------------------ | ------------------------------------------------------ |
| Framework           | Next.js 16 (App Router, Turbopack, React 19)            |
| Language            | TypeScript                                              |
| Styling             | Tailwind CSS v4 (CSS-first config, no `tailwind.config`) |
| Animation           | Framer Motion                                            |
| Icons               | lucide-react                                            |
| Markdown rendering  | react-markdown + remark-gfm + rehype-sanitize            |
| Toasts/notifications| react-hot-toast                                          |
| Video streaming     | hls.js (Mux/HLS playback on the Coming Soon page)         |
| Fonts               | next/font/google (Kanit site-wide; Instrument Serif + Barlow on Coming Soon) |

### Server

| Concern             | Choice                                    |
| -------------------- | ------------------------------------------ |
| Runtime               | Node.js (ESM), TypeScript (`tsx` in dev, `tsc` build) |
| Framework             | Express 5                                  |
| Database              | MongoDB via Mongoose 9                     |
| Auth                  | JWT in an httpOnly cookie + CSRF double-submit cookie |
| Authorization         | Roles (`ADMIN` / `EDITOR` / `VIEWER`) mapped to permissions |
| Validation             | Zod 4 (request body and query schemas)     |
| File uploads            | Multer (memory storage) → local disk or Cloudflare R2 |
| Object storage (prod)   | Cloudflare R2 via `@aws-sdk/client-s3`     |
| Security middleware      | Helmet, CORS, express-rate-limit           |
| Env config               | Zod-validated at startup — the server exits on bad config |

### Infra / conventions

- **Monorepo**: npm workspaces (`server`, `frontend`), single root
  `npm install`, `npm run dev` boots both concurrently.
- **Content**: blog posts, projects, and contact messages live in MongoDB;
  the About/Skills/Services/Experience content is static TypeScript data in
  `frontend/src/lib/siteConfig.ts`.

---

## Architecture

```
┌─────────────────────┐        HTTPS/JSON         ┌──────────────────────┐
│   frontend (:3000)   │ ────────────────────────▶ │   server (:5000)      │
│   Next.js App Router  │ ◀──────────────────────── │   Express REST API    │
│                       │      cookies (JWT, CSRF)  │                       │
│  Server components:   │                            │  routes → auth →      │
│  home/about/blog read │                            │  permission → csrf →  │
│  from the API at      │                            │  validate (zod) →     │
│  request/build time.  │                            │  controller → service │
│                       │                            │  → Mongoose model     │
│  Client components:   │                            │                       │
│  contact form, admin  │                            │  storage/ abstraction │
│  dashboard, image      │                            │  → local disk OR      │
│  uploader.             │                            │    Cloudflare R2      │
└─────────────────────┘                            └──────────┬────────────┘
                                                                  ▼
                                                          ┌───────────────┐
                                                          │   MongoDB     │
                                                          │ (Users, Posts,│
                                                          │  Projects,    │
                                                          │  Contacts)    │
                                                          └───────────────┘
```

- The frontend never talks to MongoDB directly — everything goes through the
  API (`NEXT_PUBLIC_API_URL`).
- Public reads (`publicFetch` in `frontend/src/lib/api.ts`) never send
  credentials. Admin calls (`adminFetch` in `frontend/src/lib/adminApi.ts`)
  always send the auth cookie and, for mutations, send the CSRF token in an
  `X-CSRF-Token` header.
- Responses share one shape: `{ success, data }`, plus `pagination` on list
  endpoints and `message` on errors.

---

## Project structure

```
MyPortfolio/
├── server/
│   ├── src/
│   │   ├── server.ts              # entrypoint: connects DB, checks storage, starts Express
│   │   ├── app.ts                 # Express app: middleware stack + route mounting
│   │   ├── config/                # env (zod), database, cors, rate limits, role permissions
│   │   ├── models/                # User, Post, Project, Contact (Mongoose schemas)
│   │   ├── schemas/               # Zod request schemas (body + list queries)
│   │   ├── routes/                # one file per resource; public and /admin routers
│   │   ├── controllers/           # thin request handlers
│   │   ├── services/              # business logic + DB access
│   │   │   └── storage/           # local disk vs Cloudflare R2, swappable
│   │   ├── middleware/            # auth, permission, csrf, validate, upload, errors
│   │   ├── scripts/               # create-admin
│   │   └── utils/                 # AppError, asyncHandler, jwt, slugify, readingTime, pagination
│   └── uploads/                   # local storage driver's file destination
│
└── frontend/
    ├── src/
    │   ├── app/                   # Next.js App Router routes
    │   │   ├── page.tsx           # home
    │   │   ├── about/             # about page
    │   │   ├── blog/[slug]/       # blog list + post detail
    │   │   ├── coming-soon/       # maintenance/launch page
    │   │   └── admin/
    │   │       ├── login/         # admin login (public)
    │   │       └── (dashboard)/   # posts CRUD, messages, analytics (auth-gated)
    │   ├── components/            # home, blog, admin, coming-soon, layout, ui, motion
    │   ├── lib/
    │   │   ├── siteConfig.ts      # single source of truth for static portfolio content
    │   │   ├── api.ts             # public (unauthenticated) fetch helper
    │   │   ├── adminApi.ts        # authenticated fetch helper (cookie + CSRF)
    │   │   └── adminAuthContext.tsx
    │   ├── types/                 # API response + Post types
    │   └── proxy.ts               # Next 16 "Proxy" (formerly middleware) — maintenance-mode gate
    └── public/                    # static assets
```

---

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB connection string (MongoDB Atlas free tier works)

### 1. Install

```bash
npm install                       # installs both workspaces from the root
cp server/.env.example server/.env
cp frontend/.env.example frontend/.env
```

### 2. Configure `server/.env`

- `MONGODB_URI` — your MongoDB connection string.
- `JWT_SECRET` — a random string of at least 32 characters:

  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

- `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` — your first admin login.

Make sure `NEXT_PUBLIC_API_URL` in `frontend/.env` points at the server's
`PORT`, and `FRONTEND_URL` in `server/.env` matches the frontend's origin.

### 3. Create the admin user

```bash
npm run create-admin
```

### 4. Run

```bash
npm run dev
```

| App          | URL                              |
| ------------- | ---------------------------------- |
| Frontend       | http://localhost:3000              |
| API            | http://localhost:5000/api          |
| Health check    | http://localhost:5000/api/health   |
| Admin login      | http://localhost:3000/admin/login |

### Workspace scripts (root `package.json`)

| Script                    | What it does                                          |
| --------------------------- | ------------------------------------------------------- |
| `npm run dev`                | Runs server + frontend dev servers concurrently       |
| `npm run dev:server`          | Server only (`tsx watch src/server.ts`)              |
| `npm run dev:frontend`        | Frontend only (`next dev`)                            |
| `npm run build`               | Builds the server (`tsc` → `server/dist`) and frontend |
| `npm run create-admin`        | Creates the first `ADMIN` user from `ADMIN_*` env vars |

---

## Frontend details

### Routing (App Router)

| Route                          | Type                | Notes                                          |
| -------------------------------- | ---------------------- | ------------------------------------------------- |
| `/`                                | Server                  | Hero, About, Services, Projects, Latest Posts, Contact |
| `/about`                            | Server                  | Full bio, services, process, timeline           |
| `/blog`                              | Server                  | Paginated, filterable by tag                    |
| `/blog/[slug]`                        | Server                  | Single post, Markdown rendered + sanitized       |
| `/coming-soon`                         | Client                  | HLS video background, glass CTA, email capture   |
| `/admin/login`                          | Client                  | Public — logs in via `/api/auth/login`           |
| `/admin` (dashboard group)                | Client                  | Auth-gated: posts CRUD, messages, analytics       |

### Chrome (Navbar/Footer) and the maintenance flag

- `src/components/layout/SiteChrome.tsx` wraps every route with the shared
  `Navbar`/`Footer` **except** routes in its `CHROMELESS_ROUTES` set
  (currently just `/coming-soon`, which renders its own full-bleed
  video/footer).
- `src/proxy.ts` is Next.js 16's Proxy file (the renamed `middleware.ts`
  convention). When `MAINTENANCE_MODE=true` in `frontend/.env`, every route
  **except** `/admin`, `/coming-soon`, and static files redirects to
  `/coming-soon` — so the site can be taken offline for visitors while the
  admin panel stays reachable.

### Data fetching

- `lib/api.ts` — `publicFetch<T>()`: unauthenticated, safe for server
  components, supports Next's `revalidate`.
- `lib/adminApi.ts` — `adminFetch<T>()`: client-only, always sends the auth
  cookie (`credentials: "include"`). For mutating requests it sends the CSRF
  token in `X-CSRF-Token`, read from the `csrf_token` cookie or, when that
  cookie isn't readable (API on another domain), fetched once from
  `GET /api/csrf/token` and kept in memory.

### Content model

- **Static content** (name, bio, services, process steps, experience,
  achievements, skills) lives in `src/lib/siteConfig.ts`.
- **Dynamic content** (blog posts, contact messages) is database-backed and
  managed from `/admin`.

### Styling

Tailwind CSS v4, configured entirely in `globals.css` via `@theme inline`
(no `tailwind.config.ts`). Design tokens (`--background`, `--foreground`,
`--accent`, gradients) are defined once as CSS variables and mapped to
Tailwind's `--color-*` namespace. The Coming Soon page layers its own
one-off styles (`.liquid-glass-strong`) and fonts (Instrument Serif, Barlow)
on top without touching the global theme.

---

## Server details

### Request lifecycle (`app.ts`)

```
trust proxy → helmet → cors → globalRateLimiter → express.json/urlencoded
  → cookie-parser → /uploads (static) → /api routes → notFound → errorHandler
```

Per route: `requireAuth` → `requirePermission` → `requireCsrf` (mutations) →
`validateBody` / `validateQuery` → controller → service.

### API surface

| Method | Route                              | Auth / permission                 | Notes                                   |
| ------- | ------------------------------------ | ----------------------------------- | ------------------------------------------ |
| GET      | `/api/health`                          | —                                   | Liveness check                            |
| POST      | `/api/auth/login`                        | rate-limited                        | Sets the `access_token` cookie            |
| POST      | `/api/auth/logout`                        | cookie                              | Clears auth + CSRF cookies                 |
| GET       | `/api/auth/me`                              | cookie                              | Current user (incl. role)                  |
| GET       | `/api/csrf/token`                            | —                                   | Sets `csrf_token` cookie, returns the token |
| GET       | `/api/posts?page&limit&tag`                  | —                                   | Published posts, paginated                 |
| GET       | `/api/posts/tags`                             | —                                   | Distinct tags of published posts           |
| GET       | `/api/posts/:slug`                             | —                                   | Single published post; counts a view       |
| GET       | `/api/projects`, `/api/projects/:slug`          | —                                   | Published projects                         |
| POST      | `/api/contact`                                    | rate-limited                        | Contact form (honeypot field `website`)    |
| GET       | `/api/admin/posts?page&limit`, `/:id`              | `posts:read`                        | Paginated list (no `content`), single post |
| POST      | `/api/admin/posts`                                   | `posts:create` + CSRF               | Slug derived from title if omitted         |
| PATCH     | `/api/admin/posts/:id`                                | `posts:update` + CSRF               | `coverImage: null` removes the image       |
| PATCH     | `/api/admin/posts/:id/status`                          | `posts:publish` + CSRF              | `DRAFT` / `PUBLISHED` / `ARCHIVED`         |
| DELETE    | `/api/admin/posts/:id`                                  | `posts:delete` + CSRF               |                                            |
| *         | `/api/admin/projects[/:id[/status]]`                     | `projects:*` + CSRF                 | Same pattern as posts                      |
| POST      | `/api/admin/media`                                         | `media:upload` + CSRF, rate-limited | Field `image`; returns `{ url, key }`      |
| GET       | `/api/admin/contact?page&limit`, `/:id`                     | `contacts:read`                     | Messages                                   |
| PATCH     | `/api/admin/contact/:id`                                     | `contacts:update` + CSRF            | `{ status: NEW / READ / ARCHIVED }`         |
| *         | `/api/admin/users[/:id[/status\|/password]]`                  | `users:*` + CSRF                    | User management                            |

### Roles

| Role     | Can do                                                                 |
| --------- | ------------------------------------------------------------------------ |
| `ADMIN`     | Everything                                                             |
| `EDITOR`    | Posts and projects (incl. publishing), media uploads                   |
| `VIEWER`    | Read-only: dashboard, posts, projects, contacts                        |

The role and `isActive` flag are re-read on every authenticated request, so
deactivating a user or changing their role takes effect immediately.

### Data models (Mongoose)

- **User** — `name`, `email` (unique), `passwordHash` (bcrypt, cost 12, never
  selected by default), `role`, `isActive`, `lastLoginAt`.
- **Post** — `title`, `slug` (unique), `excerpt`, `content` (Markdown),
  `coverImage { url, key, alt }`, `tags[]`, `category`, `status`
  (`DRAFT`/`PUBLISHED`/`ARCHIVED`), `author` (ref User), `publishedAt`,
  `readingTimeInMinutes`, `viewCount`, `seo { title, description, keywords }`.
- **Project** — `title`, `slug`, `shortDescription`, `description`,
  `image { url, key, alt }`, `technologies[]`, `githubUrl`, `liveUrl`,
  `category`, `featured`, `displayOrder`, `status`, `publishedAt`.
- **Contact** — `name`, `email`, `subject`, `message`, `status`
  (`NEW`/`READ`/`ARCHIVED`), `ipHash` (HMAC of the IP), `userAgent`.

### Auth flow

1. `POST /api/auth/login` verifies credentials and sets the JWT in an
   **httpOnly** `access_token` cookie.
2. `GET /api/csrf/token` sets a **readable** `csrf_token` cookie and returns
   the same token in the body.
3. `requireAuth` verifies the JWT, re-loads the user (must exist and be
   active), and attaches `{ userId, role }` to `req.user`.
4. `requireCsrf` enforces the **double-submit pattern** on mutating admin
   requests: the `X-CSRF-Token` header must match the `csrf_token` cookie.

### Storage abstraction

`services/storage/index.ts` picks a driver once, from `STORAGE_DRIVER`:

- **`local`** (default) — writes to `server/uploads/` (or `LOCAL_UPLOAD_DIR`),
  served at `/uploads/...` with `nosniff`.
- **`r2`** — uploads to a Cloudflare R2 bucket via the S3-compatible API.

Filenames are randomized and the extension comes from a MIME allowlist
(JPEG/PNG/WEBP/GIF, max 5 MB), never from the client's filename.

### Rate limiting

| Limiter               | Window   | Limit | Applies to               |
| ----------------------- | ---------- | ------- | --------------------------- |
| `globalRateLimiter`       | 15 min      | 300     | Every request                |
| `authRateLimiter`           | 15 min      | 10       | `/api/auth/login`             |
| `contactRateLimiter`          | 15 min      | 5        | `/api/contact`                 |
| `uploadRateLimiter`             | 15 min      | 60       | `/api/admin/media`               |

---

## Environment variables

### `server/.env`

| Variable            | Default                     | Purpose                                     |
| --------------------- | ------------------------------ | ------------------------------------------------ |
| `NODE_ENV`               | `development`                    | `development` / `production` / `test`            |
| `PORT`                     | `5000`                             | API port                                        |
| `FRONTEND_URL`               | `http://localhost:3000`               | CORS allowlist (comma-separate for multiple)     |
| `PUBLIC_SERVER_URL`            | `http://localhost:5000`                | Used to build local-storage upload URLs           |
| `MONGODB_URI`                   | —                                         | **Required.** MongoDB connection string           |
| `JWT_SECRET`                     | —                                          | **Required**, at least 32 characters               |
| `JWT_EXPIRES_IN`                   | `8h`                                          | Admin session length                              |
| `COOKIE_SAMESITE` / `COOKIE_SECURE`  | `lax` / `false`                                  | `none` / `true` when frontend & server are on different domains over HTTPS |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | —                                | Used only by `npm run create-admin`               |
| `STORAGE_DRIVER`                        | `local`                                            | `local` or `r2`                                   |
| `LOCAL_UPLOAD_DIR`                        | `uploads`                                            | Local storage directory (relative to `server/`)   |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` / `R2_PUBLIC_URL` | — | Required when `STORAGE_DRIVER=r2` |

### `frontend/.env`

| Variable                | Default                        | Purpose                                    |
| -------------------------- | --------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_API_URL`         | `http://localhost:5000/api`          | Base URL the frontend calls for all API requests |
| `MAINTENANCE_MODE`               | `false`                                | When `true`, every route except `/admin` redirects to `/coming-soon` |

---

## Security notes

- JWT stored in an httpOnly cookie; a separate readable `csrf_token` cookie
  implements the double-submit CSRF pattern for admin mutations.
- Role-based permissions on every admin route; inactive users are rejected
  even with a still-valid token.
- Rate limiting on everything, with tighter limits on login, the contact
  form, and uploads.
- Zod validation on request bodies and list queries; the contact form has a
  honeypot field.
- Blog content is Markdown, sanitized again at render time.
- Uploaded files are restricted by MIME type/size and stored under
  randomized names.
- Passwords hashed with bcrypt (cost 12); the hash is never selected by
  default.

---

## Deploying

- **Frontend** → Vercel (set `NEXT_PUBLIC_API_URL` to your deployed server,
  and `MAINTENANCE_MODE` if you want to gate the site).
- **Server** → any Node host; set `MONGODB_URI`, `FRONTEND_URL`,
  `PUBLIC_SERVER_URL`, `JWT_SECRET`, cookie settings and the R2 variables.
  Build with `npm run build --workspace=server` and run with
  `npm start --workspace=server` (`node dist/server.js`).
