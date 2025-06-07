import type { GameDataCache } from './types.js';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY = "tds_game_data_cache";

export function saveToCache(data: GameDataCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to cache:', error);
  }
}

export function getFromCache(): GameDataCache | null {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return null;

    const parsedData: GameDataCache = JSON.parse(cachedData);
    
    // Check if cache expired
    if (Date.now() - parsedData.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error('Failed to get from cache:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}