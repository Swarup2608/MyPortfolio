import env from '../../config/env.js';

// Storage driver is selected purely by STORAGE_DRIVER env var — callers never
// know which backend is in use. Swap local -> r2 in production with zero code changes.
const driver =
  env.storageDriver === 'r2' ? await import('./r2Storage.js') : await import('./localStorage.js');

export const uploadFile = driver.uploadFile;
export const deleteFile = driver.deleteFile;

export async function checkStorage() {
  await driver.checkConnection();
  return env.storageDriver;
}
