export interface RobloxCreator {
  id: number;
  name: string;
  type: string;
  isRNVAccount: boolean;
  hasVerifiedBadge: boolean;
}

export interface RobloxGameData {
  id: number;
  rootPlaceId: number;
  name: string;
  description: string;
  sourceName: string;
  sourceDescription: string;
  creator: RobloxCreator;
  price: number | null;
  allowedGearGenres: string[];
  allowedGearCategories: string[];
  isGenreEnforced: boolean;
  copyingAllowed: boolean;
  playing: number;
  visits: number;
  maxPlayers: number;
  created: string;
  updated: string;
  studioAccessToApisAllowed: boolean;
  createVipServersAllowed: boolean;
  universeAvatarType: string;
  genre: string;
  genre_l1?: string;
  genre_l2?: string;
  isAllGenre: boolean;
  isFavoritedByUser: boolean;
  favoritedCount: number;
}

export interface RobloxGameApiResponse {
  data: RobloxGameData[];
}

export interface RobloxMediaItem {
  assetTypeId: number;
  assetType: string;
  imageId: number;
  videoHash: string | null;
  videoTitle: string | null;
  approved: boolean;
  altText: string | null;
}

export interface RobloxMediaApiResponse {
  data: RobloxMediaItem[];
}

export interface RobloxThumbnailItem {
  targetId: number;
  state: "Completed" | "Pending" | "Blocked" | "Error";
  imageUrl: string | null;
}

export interface RobloxThumbnailsApiResponse {
  data: RobloxThumbnailItem[];
}

export interface RobloxAssetLocation {
  assetFormat: string;
  location: string;
}

export interface RobloxAssetDeliveryResponse {
  locations?: RobloxAssetLocation[];
  errors?: any[];
}

export interface RobloxGameIconItem {
  targetId: number;
  state: "Completed" | "Pending" | "Blocked" | "Error";
  imageUrl: string | null;
}

export interface RobloxGameIconApiResponse {
  data: RobloxGameIconItem[];
}

export interface GameDataCache {
  timestamp: number;
  gameType: "TDS" | "AE";
  gameDetails: {
    id: number;
    rootPlaceId: number;
    name: string;
    developer: string;
    developerId: number;
    developerType: string;
    description: string;
    price: number | null;
    universeAvatarType: string;
    subgenres: {
      genre_l1: string | null;
      genre_l2: string | null;
      isAllGenre: boolean;
    };
    settings: {
      allowedGearGenres: string[];
      allowedGearCategories: string[];
      isGenreEnforced: boolean;
      copyingAllowed: boolean;
      createVipServersAllowed: boolean;
      studioAccessToApisAllowed: boolean;
    };
    creator: {
      hasVerifiedBadge: boolean;
      isRNVAccount: boolean;
    };
  };
  gameStats: {
    activePlayers: number;
    totalVisits: number;
    maxPlayers: number;
    favoritesCount: number;
    genre: string;
    created: string;
    updated: string;
    isFavoritedByUser: boolean;
  };
  gameIconUrl: string | null;
  galleryUrls: Array<{
    url: string;
    alt: string;
  }>;
}
