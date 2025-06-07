import type { RobloxGameData, GameDataCache } from "./types.js";
import {
  formatNumber,
  formatDate,
  formatBoolean,
  formatArray,
} from "./formatter.js";

export class UIManager {
  static updateElementText(id: string, text: string): void {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = text;
  }

  static updateStatText(
    id: string,
    formattedValue: string,
    rawValue: string | number,
  ): void {
    const element = document.getElementById(id);
    if (!element) return;
    element.innerHTML = `${formattedValue} <span class="text-muted small">(${rawValue})</span>`;
  }

  static showLoadingState(isLoading: boolean): void {
    const loadButton = document.getElementById(
      "loadGameDataBtn",
    ) as HTMLButtonElement | null;
    const loadingIndicator = document.getElementById("loadingIndicator");

    if (loadButton) {
      loadButton.disabled = isLoading;
      loadButton.textContent = isLoading ? "Loading..." : "Refresh Data";
    }

    if (loadingIndicator) {
      loadingIndicator.style.display = isLoading ? "block" : "none";
    }
  }

  static updateUI(
    data: RobloxGameData | GameDataCache,
    isCache: boolean = false,
    elements: {
      titleElement: Element | null;
      developerElement: HTMLAnchorElement | null;
      descriptionElement: Element | null;
    },
  ): void {
    const { titleElement, developerElement, descriptionElement } = elements;

    const normalizedData = this.normalizeData(data, isCache);

    // Update basic info
    if (titleElement) titleElement.textContent = normalizedData.name;
    if (developerElement) {
      developerElement.textContent = normalizedData.developer;
      if (normalizedData.developerType.toLowerCase() === "user") {
        developerElement.href = `https://www.roblox.com/users/${normalizedData.developerId}/profile`;
      } else {
        developerElement.href = `https://www.roblox.com/communities/${normalizedData.developerId}`;
      }
      developerElement.target = "_blank";
    }
    if (descriptionElement) {
      descriptionElement.textContent = normalizedData.description;
    }

    // Update game stats
    this.updateStatText(
      "active-players",
      formatNumber(normalizedData.activePlayers),
      normalizedData.activePlayers,
    );
    this.updateStatText(
      "total-visits",
      formatNumber(normalizedData.totalVisits),
      normalizedData.totalVisits,
    );
    this.updateStatText(
      "max-players",
      normalizedData.maxPlayers.toString(),
      normalizedData.maxPlayers,
    );
    this.updateStatText(
      "favorites-count",
      formatNumber(normalizedData.favoritesCount),
      normalizedData.favoritesCount,
    );
    this.updateStatText(
      "game-genre",
      normalizedData.genre,
      normalizedData.genre,
    );
    this.updateStatText(
      "created-date",
      formatDate(normalizedData.created),
      normalizedData.created,
    );
    this.updateStatText(
      "updated-date",
      formatDate(normalizedData.updated),
      normalizedData.updated,
    );

    // Update game attributes
    this.updateStatText(
      "game-price",
      normalizedData.price === null ? "Free" : `R$ ${normalizedData.price}`,
      normalizedData.price === null ? "null" : normalizedData.price,
    );
    this.updateStatText(
      "avatar-type",
      normalizedData.universeAvatarType,
      normalizedData.universeAvatarType,
    );

    const subgenres = [];
    if (normalizedData.genre_l1) subgenres.push(normalizedData.genre_l1);
    if (normalizedData.genre_l2) subgenres.push(normalizedData.genre_l2);
    this.updateStatText(
      "game-subgenres",
      subgenres.length > 0 ? subgenres.join(", ") : "None",
      `l1: ${normalizedData.genre_l1 || "None"}, l2: ${normalizedData.genre_l2 || "None"}`,
    );

    this.updateStatText(
      "allowed-gear",
      formatArray(normalizedData.allowedGearGenres),
      JSON.stringify(normalizedData.allowedGearGenres),
    );
    this.updateStatText(
      "vip-servers",
      formatBoolean(normalizedData.createVipServersAllowed),
      normalizedData.createVipServersAllowed.toString(),
    );
    this.updateStatText(
      "copying-allowed",
      formatBoolean(normalizedData.copyingAllowed),
      normalizedData.copyingAllowed.toString(),
    );
    this.updateStatText(
      "genre-enforced",
      formatBoolean(normalizedData.isGenreEnforced),
      normalizedData.isGenreEnforced.toString(),
    );

    // Update creator details
    this.updateStatText(
      "creator-type",
      normalizedData.developerType,
      normalizedData.developerType,
    );
    this.updateStatText(
      "verified-badge",
      formatBoolean(normalizedData.hasVerifiedBadge),
      normalizedData.hasVerifiedBadge.toString(),
    );
    this.updateStatText(
      "rnv-account",
      formatBoolean(normalizedData.isRNVAccount),
      normalizedData.isRNVAccount.toString(),
    );

    // Update technical details
    this.updateStatText(
      "universe-id",
      normalizedData.universeId.toString(),
      normalizedData.universeId.toString(),
    );
    this.updateStatText(
      "place-id",
      normalizedData.rootPlaceId.toString(),
      normalizedData.rootPlaceId.toString(),
    );
    this.updateStatText(
      "api-access",
      formatBoolean(normalizedData.studioAccessToApisAllowed),
      normalizedData.studioAccessToApisAllowed.toString(),
    );
  }

  private static normalizeData(
    data: RobloxGameData | GameDataCache,
    isCache: boolean,
  ) {
    if (isCache) {
      const cachedData = data as GameDataCache;
      return {
        name: cachedData.gameDetails.name,
        developer: cachedData.gameDetails.developer,
        developerId: cachedData.gameDetails.developerId,
        developerType: cachedData.gameDetails.developerType,
        description: cachedData.gameDetails.description,
        activePlayers: cachedData.gameStats.activePlayers,
        totalVisits: cachedData.gameStats.totalVisits,
        maxPlayers: cachedData.gameStats.maxPlayers,
        favoritesCount: cachedData.gameStats.favoritesCount,
        genre: cachedData.gameStats.genre,
        created: cachedData.gameStats.created,
        updated: cachedData.gameStats.updated,
        price: cachedData.gameDetails.price,
        universeAvatarType: cachedData.gameDetails.universeAvatarType,
        genre_l1: cachedData.gameDetails.subgenres.genre_l1,
        genre_l2: cachedData.gameDetails.subgenres.genre_l2,
        allowedGearGenres: cachedData.gameDetails.settings.allowedGearGenres,
        createVipServersAllowed:
          cachedData.gameDetails.settings.createVipServersAllowed,
        copyingAllowed: cachedData.gameDetails.settings.copyingAllowed,
        isGenreEnforced: cachedData.gameDetails.settings.isGenreEnforced,
        hasVerifiedBadge: cachedData.gameDetails.creator.hasVerifiedBadge,
        isRNVAccount: cachedData.gameDetails.creator.isRNVAccount,
        universeId: cachedData.gameDetails.id,
        rootPlaceId: cachedData.gameDetails.rootPlaceId,
        studioAccessToApisAllowed:
          cachedData.gameDetails.settings.studioAccessToApisAllowed,
      };
    } else {
      const gameData = data as RobloxGameData;
      return {
        name: gameData.name,
        developer: gameData.creator.name,
        developerId: gameData.creator.id,
        developerType: gameData.creator.type,
        description: gameData.description,
        activePlayers: gameData.playing,
        totalVisits: gameData.visits,
        maxPlayers: gameData.maxPlayers,
        favoritesCount: gameData.favoritedCount,
        genre: gameData.genre,
        created: gameData.created,
        updated: gameData.updated,
        price: gameData.price,
        universeAvatarType: gameData.universeAvatarType,
        genre_l1: gameData.genre_l1 || null,
        genre_l2: gameData.genre_l2 || null,
        allowedGearGenres: gameData.allowedGearGenres || [],
        createVipServersAllowed: gameData.createVipServersAllowed,
        copyingAllowed: gameData.copyingAllowed,
        isGenreEnforced: gameData.isGenreEnforced,
        hasVerifiedBadge: gameData.creator.hasVerifiedBadge,
        isRNVAccount: gameData.creator.isRNVAccount,
        universeId: gameData.id,
        rootPlaceId: gameData.rootPlaceId,
        studioAccessToApisAllowed: gameData.studioAccessToApisAllowed,
      };
    }
  }
}
