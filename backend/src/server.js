import app from './app.js';
import env from './config/env.js';
import { connectDB } from './config/db.js';
import { checkStorage } from './services/storage/index.js';

async function start() {
  await connectDB();

  try {
    const driver = await checkStorage();
    if (driver === 'r2') {
      console.log('[storage] Connected to Cloudflare R2');
    } else {
      console.log('[storage] Using local disk storage');
    }
  } catch (err) {
    console.error(`[storage] Failed to reach "${env.storageDriver}" storage driver:`, err.message);
  }

  app.listen(env.port, () => {
    console.log(`[server] Listening on http://localhost:${env.port}`);
    console.log(`[health] Health check ready at http://localhost:${env.port}/api/health`);
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
