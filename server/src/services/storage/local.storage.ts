import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../../config/env.js";
import { createFileKey, type StorageDriver } from "./common.js";

// Resolved against the server package root, so it is the same from src/ (tsx) and dist/ (node).
const SERVER_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
export const LOCAL_UPLOAD_PATH = path.resolve(SERVER_ROOT, env.LOCAL_UPLOAD_DIR);

export const localDiskStorage: StorageDriver = {
    async uploadFile({ buffer, extension }) {
        const key = createFileKey(extension);
        await fs.mkdir(LOCAL_UPLOAD_PATH, { recursive: true });
        await fs.writeFile(path.join(LOCAL_UPLOAD_PATH, key), buffer);
        return { key, url: `${env.PUBLIC_SERVER_URL}/uploads/${key}` };
    },

    async checkConnection() {
        await fs.mkdir(LOCAL_UPLOAD_PATH, { recursive: true });
        await fs.access(LOCAL_UPLOAD_PATH, fs.constants.W_OK);
    },
};
