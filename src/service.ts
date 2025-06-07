import type {
  RobloxGameApiResponse,
  RobloxMediaApiResponse,
  RobloxGameIconApiResponse,
  RobloxAssetDeliveryResponse,
} from "./types.js";

// Game configurations
const GAMES = {
  TDS: {
    name: "Tower Defense Simulator",
    placeId: "3260590327",
    universeId: "1176784616",
  },
  AE: {
    name: "ALTER EGO",
    placeId: "78515341506665",
    universeId: "7419937615",
  },
} as const;

export type GameType = keyof typeof GAMES;

export class RobloxApiService {
  private static readonly PROXY_BASE = "https://occulticnine.vercel.app/?url=";
  private static currentGame: GameType = "TDS";

  static setCurrentGame(gameType: GameType): void {
    this.currentGame = gameType;
  }

  static getCurrentGame(): GameType {
    return this.currentGame;
  }

  static getCurrentGameInfo() {
    return GAMES[this.currentGame];
  }

  static async fetchGameData(): Promise<RobloxGameApiResponse> {
    const { universeId } = GAMES[this.currentGame];
    const gameApiUrl = `https://games.roproxy.com/v1/games?universeIds=${universeId}`;
    const response = await fetch(gameApiUrl);

    if (!response.ok) {
      throw new Error(
        `HTTP error fetching game data! Status: ${response.status}`,
      );
    }

    return response.json();
  }

  static async fetchGameIcon(): Promise<RobloxGameIconApiResponse> {
    const { placeId } = GAMES[this.currentGame];
    const gameIconApiUrl = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeId}&size=512x512&format=Png&isCircular=false`;
    const proxyUrl = `${this.PROXY_BASE}${encodeURIComponent(gameIconApiUrl)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch game icon: ${response.status}`);
    }

    return response.json();
  }

  static async fetchGameMedia(): Promise<RobloxMediaApiResponse> {
    const { universeId } = GAMES[this.currentGame];
    const mediaApiUrl = `https://games.roproxy.com/v2/games/${universeId}/media?fetchAllExperienceRelatedMedia=true`;
    const response = await fetch(mediaApiUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch game media: ${response.status}`);
    }

    return response.json();
  }

  static async getImageUrlFromAssetDelivery(
    imageId: number,
  ): Promise<string | null> {
    const targetUrl = `https://assetdelivery.roblox.com/v2/assetId/${imageId}`;
    const proxyUrl = `${this.PROXY_BASE}${encodeURIComponent(targetUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) return null;

      const result: RobloxAssetDeliveryResponse = await response.json();
      if (
        result.locations &&
        result.locations.length > 0 &&
        result.locations[0].location
      ) {
        return result.locations[0].location;
      }
      return null;
    } catch {
      return null;
    }
  }
}
