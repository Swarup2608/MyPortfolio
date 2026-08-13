import 'dotenv/config';

function bool(value, fallback) {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT, 10) || 5000,

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  publicBackendUrl: process.env.PUBLIC_BACKEND_URL || 'http://localhost:5000',

  mongodbUri: process.env.MONGODB_URI || '',

  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me-dev-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',

  cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',
  cookieSecure: bool(process.env.COOKIE_SECURE, false),

  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminName: process.env.ADMIN_NAME || 'Site Admin',

  storageDriver: process.env.STORAGE_DRIVER || 'local',
  localUploadDir: process.env.LOCAL_UPLOAD_DIR || 'uploads',

  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucket: process.env.R2_BUCKET || '',
    publicUrl: process.env.R2_PUBLIC_URL || '',
  },
};

if (env.isProduction && env.jwtSecret === 'dev-only-change-me-dev-only-change-me') {
  throw new Error('JWT_SECRET must be set to a strong random value in production');
}

export default env;
