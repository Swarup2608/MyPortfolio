import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/database.js";
import { storage } from "./services/storage/index.js";


async function startServer() : Promise<void> {
  await connectDB();
  try {
    await storage.checkConnection();
    console.log(env.STORAGE_DRIVER === "r2" ? "[storage] Connected to Cloudflare R2" : "[storage] Using local disk storage");
  } catch (error) {
    console.error(`[storage] Failed to reach the "${env.STORAGE_DRIVER}" storage driver:`, error);
  }
  app.listen(env.PORT, () => {
    console.log(`[server] API running on http://localhost:${env.PORT}`);
  });
}

startServer().catch((error) => {
  console.error("[server] Error starting server:", error);
  process.exit(1);
});
