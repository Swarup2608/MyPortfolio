import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { corsOptions } from "./config/cors.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import helmet from "helmet";
import {globalRateLimiter} from "./config/rate-limit.js";
import csrfRoutes from './routes/csrf.routes.js';
import postRoutes from "./routes/post.routes.js";
import publicPostRoutes from "./routes/public-post.routes.js";
import projectRoutes from "./routes/project.routes.js";
import publicProjectRoutes from "./routes/public-project.routes.js";
import contactRoutes from './routes/contact.routes.js';
import adminContactRoutes from './routes/admin-contact.routes.js';
import adminUserRoutes from "./routes/admin-user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import adminAnalyticsRoutes from "./routes/admin-analytics.routes.js";
import adminAuditRoutes from "./routes/admin-audit.routes.js";

const app = express();

app.use(requestIdMiddleware);

app.use(helmet({crossOriginResourcePolicy: { policy: "cross-origin",}}));

app.use(cors(corsOptions));

app.use(globalRateLimiter);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({extended: true, limit: "1mb",}));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    status: databaseConnected ? "healthy" : "unhealthy",
    services: {
      api: "up",
      database: databaseConnected ? "up" : "down",
    },
  });
});

app.use("/api/auth",authRoutes);
app.use("/api/csrf",csrfRoutes);
app.use("/api/admin/posts",postRoutes);
app.use("/api/admin/projects",projectRoutes);
app.use("/api/posts",publicPostRoutes);
app.use("/api/projects",publicProjectRoutes);
app.use("/api/contact",contactRoutes);
app.use("/api/admin/contact",adminContactRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/uploads",uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin/audit-logs", adminAuditRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
