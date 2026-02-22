/**
 * Storage Provider Pattern
 *
 * Location: src/lib/core/storage/
 *
 * Rules:
 * 1. Define the interface in 'interface.ts'.
 * 2. Implementations (Local, S3, R2) in separate files (e.g., local.ts).
 * 3. Use the Factory in 'index.ts' to return the correct provider.
 */

// --- File: src/lib/core/storage/interface.ts ---
export interface StorageProvider {
  upload(key: string, content: Buffer | string | Uint8Array, mimeType: string): Promise<string>;
  getDownloadUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

// --- Example Implementation: src/lib/core/storage/local.ts ---
/*
import fs from 'node:fs/promises';
import path from 'node:path';

export class LocalStorageProvider implements StorageProvider {
    async upload(key: string, content: any, mimeType: string): Promise<string> {
        // Implementation...
        return key;
    }
    // ... other methods
}
*/

// --- Example Factory: src/lib/core/storage/index.ts ---
/*
import { LocalStorageProvider } from './local';
import { CloudStorageProvider } from './cloud';

let storageInstance: StorageProvider;

export function getStorageProvider(): StorageProvider {
    if (!storageInstance) {
        const driver = process.env.STORAGE_DRIVER || 'local';
        storageInstance = driver === 'local' ? new LocalStorageProvider() : new CloudStorageProvider();
    }
    return storageInstance;
}
*/
