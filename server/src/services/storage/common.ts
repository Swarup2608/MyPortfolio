import crypto from "node:crypto";

export interface UploadInput {
    buffer: Buffer;
    extension: string;
    contentType: string;
}

export interface StoredFile {
    key: string;
    url: string;
}

export interface StorageDriver {
    uploadFile(input: UploadInput): Promise<StoredFile>;
    // Idempotent: deleting a key that doesn't exist is not an error.
    deleteFile(key: string): Promise<void>;
    checkConnection(): Promise<void>;
}

// Random keys only; the extension comes from the MIME allowlist, never the client's filename.
export function createFileKey(extension: string): string {
    return `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
}

// Keys created by createFileKey. Anything else is refused before it can reach disk or a bucket.
export const FILE_KEY_PATTERN = /^\d{10,}-[0-9a-f]{16}\.(?:jpg|png|webp|gif)$/;
