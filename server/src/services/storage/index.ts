import { env } from "../../config/env.js";
import type { StorageDriver } from "./common.js";
import { promotionEnabled } from "./promote.js";

// Chosen once from STORAGE_DRIVER, so callers never know whether files land on local disk or R2.
// Imported lazily so the S3 client is only built when R2 is actually in use.
export const storage: StorageDriver = env.STORAGE_DRIVER === "r2"
    ? (await import("./r2.storage.js")).r2Storage
    : (await import("./local.storage.js")).localDiskStorage;

// Deletes a file wherever it may live. With STORAGE_DRIVER=local and R2 configured, saved
// images are moved to R2 (see promote.ts), so the cloud copy is removed too. Both are idempotent.
export async function deleteStored(key: string): Promise<void> {
    await storage.deleteFile(key);
    if (promotionEnabled && env.STORAGE_DRIVER !== "r2") {
        const { r2Storage } = await import("./r2.storage.js");
        await r2Storage.deleteFile(key);
    }
}
