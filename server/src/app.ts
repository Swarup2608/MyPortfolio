import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import {User} from "./models/User.model.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import rbacTestRoutes from "./routes/rbac-test.routes.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import helmet from "helmet";
import {globalRateLimiter} from "./config/rate-limit.js";
import csrfRoutes from './routes/csrf.routes.js';
import { Post } from "./models/Post.model.js";
import postRoutes from "./routes/post.routes.js";
import publicPostRoutes from "./routes/public-post.routes.js";
import projectRoutes from "./routes/project.routes.js";
import publicProjectRoutes from "./routes/public-project.routes.js";
import contactRoutes from './routes/contact.routes.js';
import adminContactRoutes from './routes/admin-contact.routes.js';
import adminUserRoutes from "./routes/admin-user.routes.js";

const app = express();

app.use(helmet({crossOriginResourcePolicy: { policy: "cross-origin",}}));

app.use(cors(corsOptions));

app.use(globalRateLimiter);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({extended: true, limit: "1mb",}));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "[server] API is healthy",
  });
});

app.get("/api/users", async (_req, res) => {
  const users = await User.countDocuments();
  res.status(200).json({
    success: true,
    message: `[db] There are ${users} users in the database`,
  });
});
app.get("/api/test/post-model", async (_req, res) => {
  const postCount = await Post.countDocuments();

  res.status(200).json({
    success: true,
    postCount,
  });
});

app.use("/api/auth",authRoutes);
app.use("/api/test/rbac", rbacTestRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
app.use("/api/csrf",csrfRoutes);
app.use("/api/admin/posts",postRoutes);
app.use("/api/admin/projects",projectRoutes);
app.use("/api/posts",publicPostRoutes);
app.use("/api/projects",publicProjectRoutes);
app.use("/api/contact",contactRoutes);
app.use("/api/admin/contact",adminContactRoutes);
app.use("/api/admin/users", adminUserRoutes);

export default app;