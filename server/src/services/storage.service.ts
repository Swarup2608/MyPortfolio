import {DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "../config/r2.js";
import {env} from "../config/env.js";
import { isAssetReferenced } from "./asset-reference.service.js";

interface uploadFileInput{
    buffer: Buffer;
    contentType: string;
    key: string;
} 

export async function uploadFile({ buffer, contentType, key}: uploadFileInput): Promise<{
    key: string;
    url: string;
}> {
    await r2Client.send(
        new PutObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        })
    );

    return {
        key,
        // The S3-API endpoint requires SigV4 auth and isn't browser-viewable —
        // R2_PUBLIC_URL is the actual public bucket domain (custom domain or r2.dev).
        url: `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`,
    };
}

export async function deleteFile(key: string): Promise<void> {
    await r2Client.send(
        new DeleteObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: key,
        })
    );
}

// Only removes the R2 object if no Post/Project still references it — a key
// can be shared across resources, so losing one reference must not delete
// an object another resource depends on.
export async function deleteImageIfUnused(key: string): Promise<boolean> {
    const referenced = await isAssetReferenced(key);
    if (referenced) {
        return false;
    }
    await deleteFile(key);
    return true;
}