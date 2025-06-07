import type { GameDataCache } from "./types.js";

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY_PREFIX = "tds_game_data_cache_";

function getCacheKey(gameType: "TDS" | "AE"): string {
  return `${CACHE_KEY_PREFIX}${gameType}`;
}

export function saveToCache(data: GameDataCache): void {
  try {
    const cacheKey = getCacheKey(data.gameType);
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to cache:", error);
  }
}

export function getFromCache(
  gameType: "TDS" | "AE" = "TDS",
): GameDataCache | null {
  try {
    const cacheKey = getCacheKey(gameType);
    const cachedData = localStorage.getItem(cacheKey);
    if (!cachedData) return null;

    const parsedData: GameDataCache = JSON.parse(cachedData);

    // Check if cache expired
    if (Date.now() - parsedData.timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error("Failed to get from cache:", error);
    const cacheKey = getCacheKey(gameType);
    localStorage.removeItem(cacheKey);
    return null;
  }
}

export function clearCache(gameType?: "TDS" | "AE"): void {
  try {
    if (gameType) {
      const cacheKey = getCacheKey(gameType);
      localStorage.removeItem(cacheKey);
    } else {
      // Clear all game caches
      localStorage.removeItem(getCacheKey("TDS"));
      localStorage.removeItem(getCacheKey("AE"));
    }
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
}
