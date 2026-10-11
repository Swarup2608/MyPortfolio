import { env } from "../../config/env.js";
import type { StorageDriver } from "./common.js";

// Chosen once from STORAGE_DRIVER, so callers never know whether files land on local disk or R2.
// Imported lazily so the S3 client is only built when R2 is actually in use.
export const storage: StorageDriver = env.STORAGE_DRIVER === "r2"
    ? (await import("./r2.storage.js")).r2Storage
    : (await import("./local.storage.js")).localDiskStorage;
