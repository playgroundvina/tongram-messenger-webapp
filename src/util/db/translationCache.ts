/* eslint-disable no-null/no-null */

import type { ApiMessage } from '../../api/types';

const DB_NAME = 'TongramDB';
const DB_VERSION = 1;
const STORE_NAME = 'translations';

interface CachedTranslation {
  id: string; // messageId_targetLanguage
  chatId: string;
  messageId: number;
  targetLanguage: string;
  text: string;
  translation: string;
  timestamp: number;
}

let dbInstance: IDBDatabase | null = null;

async function initializeDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });

        store.createIndex('by_chat', 'chatId', { unique: false });
        store.createIndex(
          'by_message_lang',
          ['messageId', 'targetLanguage'],
          { unique: true },
        );
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Build cache key
 */
function buildCacheId(messageId: string, targetLanguage: string) {
  return `${messageId}_${targetLanguage}`;
}

export async function getCachedTranslation(
  message: ApiMessage,
  targetLanguage: string,
): Promise<string | null> {
  try {
    const db = await initializeDB();
    const id = buildCacheId(message.id as unknown as string, targetLanguage);

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () =>
        resolve((req.result as CachedTranslation | undefined)?.translation ?? null);

      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

export async function saveCachedTranslation(
  message: ApiMessage,
  targetLanguage: string,
  translation: string,
): Promise<void> {
  try {
    const db = await initializeDB();
    const text = message.content.text?.text;

    const record: CachedTranslation = {
      id: buildCacheId(message.id as unknown as string, targetLanguage),
      chatId: message.chatId,
      messageId: message.id,
      text: text!,
      targetLanguage,
      translation,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record); // upsert

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) { /* empty */ }
}
