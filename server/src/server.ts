import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/database.js";


async function startServer() : Promise<void> {
  await connectDB();  
  app.listen(env.PORT, () => {
    console.log(`[server] API running on http://localhost:${env.PORT}`);
  });
}

startServer().catch((error) => {
  console.error("[server] Error starting server:", error);
  process.exit(1);
});
