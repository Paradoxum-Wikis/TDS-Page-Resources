interface CachedImage {
  blob: Blob;
  timestamp: number;
  originalUrl: string;
}

const DB_NAME = "image-cache";
const DB_VERSION = 1;
const STORE_NAME = "images";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

class ImageCacheDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "url" });
        }
      };
    });
  }

  async cacheImage(url: string, blob: Blob): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const cacheEntry: CachedImage & { url: string } = {
      url,
      blob,
      timestamp: Date.now(),
      originalUrl: url,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cacheEntry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedImage(url: string): Promise<string | null> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(url);
      request.onsuccess = () => {
        const result = request.result as
          | (CachedImage & { url: string })
          | undefined;

        if (!result) {
          resolve(null);
          return;
        }

        // expiry check
        if (Date.now() - result.timestamp > CACHE_DURATION) {
          this.deleteCachedImage(url);
          resolve(null);
          return;
        }

        const blobUrl = URL.createObjectURL(result.blob);
        resolve(blobUrl);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCachedImage(url: string): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(url);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllImages(): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

const imageCache = new ImageCacheDB();

export async function getCachedImageUrl(originalUrl: string): Promise<string> {
  try {
    const cachedUrl = await imageCache.getCachedImage(originalUrl);
    if (cachedUrl) {
      console.log("[imageCache] Using cached image for:", originalUrl);
      return cachedUrl;
    }

    console.log("[imageCache] Fetching and caching image:", originalUrl);
    const response = await fetch(originalUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    await imageCache.cacheImage(originalUrl, blob);

    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } catch (error) {
    console.error("[imageCache] Failed to cache image:", error);
    return originalUrl;
  }
}

export async function clearImageCache(): Promise<void> {
  try {
    await imageCache.clearAllImages();
    console.log("[imageCache] Image cache cleared");
  } catch (error) {
    console.error("[imageCache] Failed to clear image cache:", error);
  }
}
