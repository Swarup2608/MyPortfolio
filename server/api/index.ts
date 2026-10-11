import app from "../src/app.js";
import { connectDB } from "../src/config/database.js";

let databaseConnectionPromise: Promise<void> | undefined;

async function handler(
  req: Parameters<typeof app>[0],
  res: Parameters<typeof app>[1],
) {
  if (!databaseConnectionPromise) {
    databaseConnectionPromise = connectDB().catch((error) => {
      databaseConnectionPromise = undefined;
      throw error;
    });
  }

  await databaseConnectionPromise;

  return app(req, res);
}

export default handler;
