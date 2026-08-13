import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import env from '../../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', '..', '..', env.localUploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function checkConnection() {
  await fs.promises.access(uploadDir, fs.constants.W_OK);
}

// Extension is taken only from a small allowlist resolved by mimetype in the
// upload middleware — never trust the client-supplied filename directly.
export async function uploadFile({ buffer, extension }) {
  const key = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
  const filePath = path.join(uploadDir, key);
  await fs.promises.writeFile(filePath, buffer);
  return {
    key,
    url: `${env.publicBackendUrl}/uploads/${key}`,
  };
}

export async function deleteFile(key) {
  const safeKey = path.basename(key); // guard against path traversal
  const filePath = path.join(uploadDir, safeKey);
  await fs.promises.unlink(filePath).catch(() => {});
}
