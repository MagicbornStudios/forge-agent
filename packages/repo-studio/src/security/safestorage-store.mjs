import fs from 'node:fs/promises';
import path from 'node:path';

async function ensureParentDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export function createSafeStorageStore(options = {}) {
  const filePath = String(options.filePath || '').trim();
  const safeStorage = options.safeStorage;
  if (!filePath) return null;
  if (!safeStorage || typeof safeStorage.isEncryptionAvailable !== 'function') return null;
  if (!safeStorage.isEncryptionAvailable()) return null;
  if (
    typeof safeStorage.encryptString !== 'function'
    || typeof safeStorage.decryptString !== 'function'
  ) {
    return null;
  }

  return {
    name: 'safeStorage',
    async read() {
      try {
        const encoded = await fs.readFile(filePath, 'utf8');
        const payload = JSON.parse(encoded);
        const cipherText = String(payload?.cipherText || '');
        if (!cipherText) return null;
        const decrypted = safeStorage.decryptString(Buffer.from(cipherText, 'base64'));
        return String(decrypted || '') || null;
      } catch {
        return null;
      }
    },
    async write(secret) {
      await ensureParentDir(filePath);
      const encrypted = safeStorage.encryptString(String(secret || ''));
      await fs.writeFile(
        filePath,
        `${JSON.stringify({ cipherText: encrypted.toString('base64') }, null, 2)}\n`,
        'utf8',
      );
    },
    async clear() {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
          return;
        }
        throw error;
      }
    },
  };
}
