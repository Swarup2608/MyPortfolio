import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import env from '../../config/env.js';

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.r2.accessKeyId,
    secretAccessKey: env.r2.secretAccessKey,
  },
});

export async function checkConnection() {
  if (!env.r2.accountId || !env.r2.accessKeyId || !env.r2.secretAccessKey || !env.r2.bucket) {
    throw new Error('R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY or R2_BUCKET is not set');
  }
  await client.send(new HeadBucketCommand({ Bucket: env.r2.bucket }));
}

export async function uploadFile({ buffer, extension, contentType }) {
  const key = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;

  await client.send(
    new PutObjectCommand({
      Bucket: env.r2.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return {
    key,
    url: `${env.r2.publicUrl.replace(/\/$/, '')}/${key}`,
  };
}

export async function deleteFile(key) {
  await client.send(new DeleteObjectCommand({ Bucket: env.r2.bucket, Key: key }));
}
