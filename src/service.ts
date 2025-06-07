import type {
  RobloxGameApiResponse,
  RobloxMediaApiResponse,
  RobloxGameIconApiResponse,
  RobloxAssetDeliveryResponse
} from './types.js';

const PLACE_ID = "3260590327";
const UNIVERSE_ID = "1176784616";

export class RobloxApiService {
  private static readonly PROXY_BASE = "https://occulticnine.vercel.app/?url=";
  
  static async fetchGameData(): Promise<RobloxGameApiResponse> {
    const gameApiUrl = `https://games.roproxy.com/v1/games?universeIds=${UNIVERSE_ID}`;
    const response = await fetch(gameApiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error fetching game data! Status: ${response.status}`);
    }
    
    return response.json();
  }

  static async fetchGameIcon(): Promise<RobloxGameIconApiResponse> {
    const gameIconApiUrl = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${PLACE_ID}&size=512x512&format=Png&isCircular=false`;
    const proxyUrl = `${this.PROXY_BASE}${encodeURIComponent(gameIconApiUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch game icon: ${response.status}`);
    }
    
    return response.json();
  }

  static async fetchGameMedia(): Promise<RobloxMediaApiResponse> {
    const mediaApiUrl = `https://games.roproxy.com/v2/games/${UNIVERSE_ID}/media?fetchAllExperienceRelatedMedia=true`;
    const response = await fetch(mediaApiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch game media: ${response.status}`);
    }
    
    return response.json();
  }

  static async getImageUrlFromAssetDelivery(imageId: number): Promise<string | null> {
    const targetUrl = `https://assetdelivery.roblox.com/v2/assetId/${imageId}`;
    const proxyUrl = `${this.PROXY_BASE}${encodeURIComponent(targetUrl)}`;
    
    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) return null;

      const result: RobloxAssetDeliveryResponse = await response.json();
      if (result.locations && result.locations.length > 0 && result.locations[0].location) {
        return result.locations[0].location;
      }
      return null;
    } catch {
      return null;
    }
  }
}