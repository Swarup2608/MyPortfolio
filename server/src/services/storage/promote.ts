import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../../config/env.js";
import { Media } from "../../models/Media.model.js";
import { ALLOWED_IMAGE_TYPES } from "../../middleware/upload.middleware.js";
import type { StoredFile, UploadInput } from "./common.js";
import { LOCAL_UPLOAD_PATH } from "./local.storage.js";

// Images uploaded to local disk (STORAGE_DRIVER=local, or older uploads) are moved to R2 when
// the post/project that references them is saved, and the saved URLs are rewritten to the cloud ones.

interface ImageRef {
    url: string;
    key: string;
}

type UploadToCloud = (input: UploadInput) => Promise<StoredFile>;

const EXTENSIONS = Object.values(ALLOWED_IMAGE_TYPES);
const CONTENT_TYPE_BY_EXTENSION = Object.fromEntries(
    Object.entries(ALLOWED_IMAGE_TYPES).map(([type, extension]) => [extension, type]),
);

// Matches the URLs the local driver hands out: <host>/uploads/<timestamp>-<16 hex><ext>.
// The strict key shape means a match can never contain a path separator or "..".
const LOCAL_URL_SOURCE = `(?:https?://[^\\s)"'<>]+)?/uploads/(\\d{10,}-[0-9a-f]{16}(?:${EXTENSIONS.map((e) => `\\${e}`).join("|")}))`;

const IMAGE_FIELDS = ["coverImage", "image"] as const;

// The storage key of a local-upload URL, or undefined if the URL is anything else.
function localKey(url: string | undefined): string | undefined {
    return new RegExp(LOCAL_URL_SOURCE).exec(url ?? "")?.[1];
}

const r2Values = {
    R2_ACCOUNT_ID: env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: env.R2_PUBLIC_URL,
};
// Names only, never values.
const missingR2Settings = Object.entries(r2Values).filter(([, value]) => !value).map(([name]) => name);
const r2Configured = missingR2Settings.length === 0;

// Active whenever R2 is configured. With STORAGE_DRIVER=r2 new uploads already go to R2, but images
// uploaded earlier to local disk are still moved on save; with no local files this is a no-op.
export const promotionEnabled = r2Configured;

console.log(
    promotionEnabled
        ? `[media] Images on local disk are moved to R2 when a post/project is saved (STORAGE_DRIVER=${env.STORAGE_DRIVER}).`
        : `[media] Moving images to R2 on save is OFF. Missing or empty in server/.env: ${missingR2Settings.join(", ")}`,
);

interface Promotable {
    content?: string;
    coverImage?: ImageRef | null;
    image?: ImageRef | null;
}

export interface Promoted<T> {
    input: T;
    // Deletes the local copies. Call it only after the record has been saved.
    cleanup: () => Promise<void>;
    // Local storage keys that were moved to the cloud.
    movedKeys: string[];
}

export async function promoteWith<T extends Promotable>(input: T, uploadToCloud: UploadToCloud): Promise<Promoted<T>> {
    const keys = new Set<string>();
    for (const match of input.content?.matchAll(new RegExp(LOCAL_URL_SOURCE, "g")) ?? []) {
        if (match[1]) keys.add(match[1]);
    }
    for (const field of IMAGE_FIELDS) {
        const key = localKey(input[field]?.url);
        if (key) keys.add(key);
    }
    if (keys.size === 0) return { input, cleanup: async () => {}, movedKeys: [] };

    const moved = new Map<string, StoredFile>();
    await Promise.all([...keys].map(async (key) => {
        let buffer: Buffer;
        try {
            buffer = await fs.readFile(path.join(LOCAL_UPLOAD_PATH, key));
        } catch {
            return; // file is gone (e.g. already moved) — leave that URL untouched
        }
        const extension = path.extname(key);
        moved.set(key, await uploadToCloud({ buffer, extension, contentType: CONTENT_TYPE_BY_EXTENSION[extension] ?? "application/octet-stream" }));
    }));

    const result: T = { ...input };
    if (input.content !== undefined) {
        const rewritten: string = input.content.replace(
            new RegExp(LOCAL_URL_SOURCE, "g"),
            (url: string, key: string): string => moved.get(key)?.url ?? url,
        );
        result.content = rewritten;
    }
    for (const field of IMAGE_FIELDS) {
        const image = input[field];
        const key = localKey(image?.url);
        const file = key ? moved.get(key) : undefined;
        if (image && file) result[field] = { ...image, url: file.url, key: file.key };
    }

    return {
        input: result,
        movedKeys: [...moved.keys()],
        cleanup: async () => {
            await Promise.all([...moved.keys()].map((key) => fs.rm(path.join(LOCAL_UPLOAD_PATH, key), { force: true })));
        },
    };
}

export async function promoteLocalImages<T extends Promotable>(input: T): Promise<Promoted<T>> {
    if (!promotionEnabled) return { input, cleanup: async () => {}, movedKeys: [] };
    // Imported lazily so the S3 client is only built when R2 is actually used.
    const { r2Storage } = await import("./r2.storage.js");
    const promoted = await promoteWith(input, (file) => r2Storage.uploadFile(file));
    if (promoted.movedKeys.length) console.log(`[media] Moved ${promoted.movedKeys.length} image(s) to R2.`);
    return {
        ...promoted,
        // The local files are gone after cleanup, so drop their upload-tracking rows too.
        cleanup: async () => {
            await promoted.cleanup();
            if (promoted.movedKeys.length) await Media.deleteMany({ key: { $in: promoted.movedKeys } });
        },
    };
}
