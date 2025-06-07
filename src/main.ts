import { RobloxApiService } from './service.js';
import { UIManager } from './uiManage.js';
import { getFromCache, saveToCache } from './cacheManage.js';
import { downloadImage } from './downloader.js';
import type { GameDataCache } from './types.js';

class TDSPageManager {
  private async fetchGameDataAndUpdatePage(): Promise<void> {
    UIManager.showLoadingState(true);

    const elements = {
      titleElement: document.querySelector('.game-details h1.h3'),
      developerElement: document.querySelector('.game-details p.text-muted a') as HTMLAnchorElement | null,
      descriptionElement: document.querySelector('.game-details h2.h5 + p')
    };

    const cacheData: GameDataCache = {
      timestamp: Date.now(),
      gameDetails: {
        id: 0, rootPlaceId: 0, name: '', developer: '', developerId: 0,
        developerType: '', description: '', price: null, universeAvatarType: '',
        subgenres: { genre_l1: null, genre_l2: null, isAllGenre: false },
        settings: {
          allowedGearGenres: [], allowedGearCategories: [], isGenreEnforced: false,
          copyingAllowed: false, createVipServersAllowed: false, studioAccessToApisAllowed: false
        },
        creator: { hasVerifiedBadge: false, isRNVAccount: false }
      },
      gameStats: {
        activePlayers: 0, totalVisits: 0, maxPlayers: 0, favoritesCount: 0,
        genre: '', created: '', updated: '', isFavoritedByUser: false
      },
      gameIconUrl: null,
      galleryUrls: []
    };

    try {
      // Fetch game icon
      try {
        const iconResult = await RobloxApiService.fetchGameIcon();
        if (iconResult.data && iconResult.data.length > 0 && 
            iconResult.data[0].state === 'Completed' && iconResult.data[0].imageUrl) {
          const gameIconElement = document.querySelector('.game-icon img') as HTMLImageElement | null;
          if (gameIconElement) {
            gameIconElement.src = iconResult.data[0].imageUrl;
            gameIconElement.alt = 'Tower Defense Simulator Game Icon';
            cacheData.gameIconUrl = iconResult.data[0].imageUrl;
            
            gameIconElement.style.cursor = 'pointer';
            gameIconElement.onclick = () => {
              if (cacheData.gameIconUrl) {
                downloadImage(cacheData.gameIconUrl, 'game-icon');
              }
            };
          }
        }
      } catch (iconError) {
        console.error('Failed to fetch game icon:', iconError);
      }

      // Fetch game data
      const gameResult = await RobloxApiService.fetchGameData();
      
      if (gameResult.data && gameResult.data.length > 0) {
        const gameData = gameResult.data[0];
        
        UIManager.updateUI(gameData, false, elements);
        
        this.populateCacheFromGameData(cacheData, gameData);
        await this.fetchAndUpdateMedia(cacheData);
        
        saveToCache(cacheData);
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
      this.showError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      UIManager.showLoadingState(false);
    }
  }

  private populateCacheFromGameData(cacheData: GameDataCache, gameData: any): void {
    // Populate cache data from API response
    cacheData.gameDetails.id = gameData.id;
    cacheData.gameDetails.rootPlaceId = gameData.rootPlaceId;
    cacheData.gameDetails.name = gameData.name;
    cacheData.gameDetails.developer = gameData.creator.name;
    cacheData.gameDetails.developerId = gameData.creator.id;
    cacheData.gameDetails.developerType = gameData.creator.type;
    cacheData.gameDetails.description = gameData.description;
    cacheData.gameDetails.price = gameData.price;
    cacheData.gameDetails.universeAvatarType = gameData.universeAvatarType;

    // Subgenres
    cacheData.gameDetails.subgenres.genre_l1 = gameData.genre_l1 || null;
    cacheData.gameDetails.subgenres.genre_l2 = gameData.genre_l2 || null;
    cacheData.gameDetails.subgenres.isAllGenre = gameData.isAllGenre;

    // Settings
    cacheData.gameDetails.settings.allowedGearGenres = gameData.allowedGearGenres || [];
    cacheData.gameDetails.settings.allowedGearCategories = gameData.allowedGearCategories || [];
    cacheData.gameDetails.settings.isGenreEnforced = gameData.isGenreEnforced;
    cacheData.gameDetails.settings.copyingAllowed = gameData.copyingAllowed;
    cacheData.gameDetails.settings.createVipServersAllowed = gameData.createVipServersAllowed;
    cacheData.gameDetails.settings.studioAccessToApisAllowed = gameData.studioAccessToApisAllowed;

    // Creator
    cacheData.gameDetails.creator.hasVerifiedBadge = gameData.creator.hasVerifiedBadge;
    cacheData.gameDetails.creator.isRNVAccount = gameData.creator.isRNVAccount;

    // Stats
    cacheData.gameStats.activePlayers = gameData.playing;
    cacheData.gameStats.totalVisits = gameData.visits;
    cacheData.gameStats.maxPlayers = gameData.maxPlayers;
    cacheData.gameStats.favoritesCount = gameData.favoritedCount;
    cacheData.gameStats.genre = gameData.genre;
    cacheData.gameStats.created = gameData.created;
    cacheData.gameStats.updated = gameData.updated;
    cacheData.gameStats.isFavoritedByUser = gameData.isFavoritedByUser;
  }

  private async fetchAndUpdateMedia(cacheData: GameDataCache): Promise<void> {
    try {
      const mediaResult = await RobloxApiService.fetchGameMedia();
      const galleryContainer = document.querySelector('.thumbnail-gallery .d-flex') as HTMLElement | null;
      
      if (mediaResult.data && mediaResult.data.length > 0 && galleryContainer) {
        const imageItems = mediaResult.data.filter(item => item.assetType === 'Image' && item.approved);
        
        if (imageItems.length > 0) {
          galleryContainer.innerHTML = '';
          
          const galleryImagePromises = imageItems.map(async (item, index) => {
            const imageUrl = await RobloxApiService.getImageUrlFromAssetDelivery(item.imageId);
            
            if (imageUrl) {
              const img = document.createElement('img');
              img.src = imageUrl;
              const altText = item.altText || `TDS thumbnail ${index + 1}`;
              img.alt = altText;
              img.classList.add('img-fluid', 'rounded25', 'me-2', 'mb-2');
              img.dataset.downloadUrl = imageUrl;
              img.dataset.downloadFilename = `thumbnail-${index + 1}`;

              cacheData.galleryUrls.push({ url: imageUrl, alt: altText });
              return img;
            }
            return null;
          });

          const galleryImages = await Promise.all(galleryImagePromises);
          galleryImages.forEach(img => {
            if (img && galleryContainer) {
              galleryContainer.appendChild(img);
            }
          });

          this.setupGalleryClickHandler(galleryContainer);
        }
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
    }
  }

  private setupGalleryClickHandler(container: HTMLElement): void {
    container.onclick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'IMG' && target.dataset.downloadUrl && target.dataset.downloadFilename) {
        downloadImage(target.dataset.downloadUrl, target.dataset.downloadFilename);
      }
    };
  }

  private showError(message: string): void {
    const detailsContainer = document.querySelector('.game-details');
    if (detailsContainer) {
      const errorP = document.createElement('p');
      errorP.classList.add('text-danger');
      errorP.textContent = `An error occurred: ${message}`;
      detailsContainer.prepend(errorP);
    }
  }

  private populateUIFromCache(cache: GameDataCache): void {
    const gameIconElement = document.querySelector('.game-icon img') as HTMLImageElement | null;
    const galleryContainer = document.querySelector('.thumbnail-gallery .d-flex') as HTMLElement | null;

    if (gameIconElement && cache.gameIconUrl) {
      gameIconElement.src = cache.gameIconUrl;
      gameIconElement.alt = 'Tower Defense Simulator Game Icon';
      gameIconElement.style.cursor = 'pointer';
      gameIconElement.onclick = () => {
        if (cache.gameIconUrl) {
          downloadImage(cache.gameIconUrl, 'game-icon');
        }
      };
    }

    if (galleryContainer) {
      galleryContainer.innerHTML = '';
      
      if (cache.galleryUrls.length > 0) {
        cache.galleryUrls.forEach((item, index) => {
          const img = document.createElement('img');
          img.src = item.url;
          img.alt = item.alt;
          img.classList.add('img-fluid', 'rounded25', 'me-2', 'mb-2');
          img.dataset.downloadUrl = item.url;
          img.dataset.downloadFilename = `thumbnail-${index + 1}`;
          galleryContainer.appendChild(img);
        });
        
        this.setupGalleryClickHandler(galleryContainer);
      } else {
        galleryContainer.innerHTML = '<p class="text-muted">No thumbnails available.</p>';
      }
    }

    const elements = {
      titleElement: document.querySelector('.game-details h1.h3'),
      developerElement: document.querySelector('.game-details p.text-muted a') as HTMLAnchorElement | null,
      descriptionElement: document.querySelector('.game-details h2.h5 + p')
    };
    
    UIManager.updateUI(cache, true, elements);
  }

  private setupHDButtonListener(): void {
    const hdButton = document.getElementById('hdDownloadBtn');
    if (hdButton) {
      hdButton.addEventListener('click', () => {
        const gameIcon = document.querySelector('.game-icon img') as HTMLImageElement;
        if (!gameIcon || !gameIcon.src) {
          console.error('No game icon found or src is empty');
          return;
        }

        const hdUrl = gameIcon.src.replace('/512/512/', '/1024/1024/');
        downloadImage(hdUrl, 'game-icon-full');
      });
    }
  }

  public initialize(): void {
    const cachedData = getFromCache();
    if (cachedData) {
      this.populateUIFromCache(cachedData);
    }

    const loadButton = document.getElementById('loadGameDataBtn');
    if (loadButton) {
      loadButton.addEventListener('click', () => this.fetchGameDataAndUpdatePage());
    }

    this.setupHDButtonListener();
  }
}

const tdsManager = new TDSPageManager();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => tdsManager.initialize());
} else {
  tdsManager.initialize();
}
