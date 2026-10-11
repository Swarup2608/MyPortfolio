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
    checkConnection(): Promise<void>;
}

// Random keys only; the extension comes from the MIME allowlist, never the client's filename.
export function createFileKey(extension: string): string {
    return `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
}
