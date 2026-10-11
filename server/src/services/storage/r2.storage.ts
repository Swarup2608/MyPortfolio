import { HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../../config/env.js";
import { createFileKey, type StorageDriver } from "./common.js";

const client = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
});

export const r2Storage: StorageDriver = {
    async uploadFile({ buffer, extension, contentType }) {
        const key = createFileKey(extension);
        await client.send(new PutObjectCommand({
            Bucket: env.R2_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }));
        return { key, url: `${env.R2_PUBLIC_URL}/${key}` };
    },

    async checkConnection() {
        await client.send(new HeadBucketCommand({ Bucket: env.R2_BUCKET }));
    },
};
