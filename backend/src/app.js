import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';

import env from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = env.frontendUrl.split(',').map((o) => o.trim());

app.use(
  helmet({
    // Images are served cross-origin (different port in dev) to the frontend.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
if (env.nodeEnv === 'development') app.use(morgan('dev'));
app.use(generalLimiter);

app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', env.localUploadDir), {
    maxAge: '7d',
    // Prevent uploaded files from ever being executed as scripts.
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  })
);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
