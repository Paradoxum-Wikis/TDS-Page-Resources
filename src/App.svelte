<script lang="ts">
  import { onMount } from 'svelte';
  import { RobloxApiService } from './modules/service';
  import { getFromCache, saveToCache } from './modules/cacheManage';
  import { getCachedImageUrl } from './modules/imageCache';
  import type { GameDataCache, GameType } from './modules/types';
  
  import Navigation from './components/Navigation.svelte';
  import GameSwitcher from './components/GameSwitcher.svelte';
  import Gallery from './components/Gallery.svelte';
  import GameDetails from './components/GameDetails.svelte';
  import HeroSection from './components/HeroSection.svelte';
  import LoadingButton from './components/LoadingButton.svelte';
  import Settings from './components/Settings.svelte';

  import 'bootstrap/dist/css/bootstrap.min.css';
  import 'bootstrap-icons/font/bootstrap-icons.css';
  import 'bootstrap/dist/js/bootstrap.bundle.min.js';
  import './styles.css';

  let currentGame = $state<GameType>('TDS');
  let loading = $state(false);
  let gameData = $state<GameDataCache | null>(null);
  let error = $state<string | null>(null);
  let hasLoadedOnce = $state(false);
  let cachedGameIconUrl = $state<string | null>(null);
  let originalGameIconUrl = $state<string | null>(null);
  let cachedThumbnails = $state<Array<{ url: string; alt: string; }>>([]);

  const buttonText = $derived(hasLoadedOnce ? 'Refresh Data' : 'Load Game Details');

  function handleGameSwitch(gameType: GameType) {
    if (currentGame === gameType) return;
    
    currentGame = gameType;
    RobloxApiService.setCurrentGame(gameType);
    
    const cachedData = getFromCache(gameType);
    if (cachedData && cachedData.gameType === gameType) {
      populateFromCache(cachedData);
    } else {
      // re to empty state
      gameData = null;
      cachedGameIconUrl = null;
      cachedThumbnails = [];
    }
  }

  async function loadGameData() {
    loading = true;
    error = null;

    try {
      let originalGameIconUrlFromAPI: string | null = null;
      
      try {
        const iconResult = await RobloxApiService.fetchGameIcon();
        if (iconResult.data?.[0]?.state === 'Completed' && iconResult.data[0].imageUrl) {
          originalGameIconUrlFromAPI = iconResult.data[0].imageUrl;
        }
      } catch (iconError) {
        console.error('Failed to fetch game icon:', iconError);
      }

      // Fetch game data
      const gameResult = await RobloxApiService.fetchGameData();
      if (gameResult.data?.[0]) {
        const game = gameResult.data[0];
        
        // Fetch media
        const mediaResult = await RobloxApiService.fetchGameMedia();
        const galleryUrls: Array<{ url: string; alt: string; }> = [];
        
        for (const media of mediaResult.data || []) {
          if (media.imageId && media.approved) {
            const imageUrl = await RobloxApiService.getImageUrlFromAssetDelivery(media.imageId);
            if (imageUrl) {
              galleryUrls.push({
                url: imageUrl,
                alt: media.altText || `Game Image ${media.imageId}`
              });
            }
          }
        }

        if (originalGameIconUrlFromAPI) {
          cachedGameIconUrl = await getCachedImageUrl(originalGameIconUrlFromAPI);
        }

        const cachedGalleryUrls: Array<{ url: string; alt: string; }> = [];
        for (const thumbnail of galleryUrls) {
          const cachedUrl = await getCachedImageUrl(thumbnail.url);
          cachedGalleryUrls.push({
            url: cachedUrl,
            alt: thumbnail.alt
          });
        }
        cachedThumbnails = cachedGalleryUrls;

        const cacheData: GameDataCache = {
          timestamp: Date.now(),
          gameType: currentGame,
          gameDetails: {
            id: game.id,
            rootPlaceId: game.rootPlaceId,
            name: game.name,
            developer: game.creator.name,
            developerId: game.creator.id,
            developerType: game.creator.type,
            description: game.description,
            price: game.price || null,
            universeAvatarType: game.universeAvatarType,
            subgenres: {
              genre_l1: game.genre_l1 || null,
              genre_l2: game.genre_l2 || null, 
              isAllGenre: game.isAllGenre
            },
            settings: {
              allowedGearGenres: game.allowedGearGenres,
              allowedGearCategories: game.allowedGearCategories,
              isGenreEnforced: game.isGenreEnforced,
              copyingAllowed: game.copyingAllowed,
              createVipServersAllowed: game.createVipServersAllowed,
              studioAccessToApisAllowed: game.studioAccessToApisAllowed
            },
            creator: {
              hasVerifiedBadge: game.creator.hasVerifiedBadge,
              isRNVAccount: game.creator.isRNVAccount
            }
          },
          gameStats: {
            activePlayers: game.playing,
            totalVisits: game.visits,
            maxPlayers: game.maxPlayers,
            favoritesCount: game.favoritedCount,
            genre: game.genre,
            created: game.created,
            updated: game.updated,
            isFavoritedByUser: game.isFavoritedByUser
          },
          gameIconUrl: originalGameIconUrlFromAPI,
          galleryUrls,
        };

        gameData = cacheData;
        saveToCache(cacheData);
        hasLoadedOnce = true;
        originalGameIconUrl = originalGameIconUrlFromAPI;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error occurred';
    } finally {
      loading = false;
    }
  }

  async function populateFromCache(cache: GameDataCache) {
    gameData = cache;
    originalGameIconUrl = cache.gameIconUrl;

    if (cache.gameIconUrl) {
      cachedGameIconUrl = await getCachedImageUrl(cache.gameIconUrl);
    }
    
    const cachedGalleryUrls: Array<{ url: string; alt: string; }> = [];
    for (const thumbnail of cache.galleryUrls) {
      const cachedUrl = await getCachedImageUrl(thumbnail.url);
      cachedGalleryUrls.push({
        url: cachedUrl,
        alt: thumbnail.alt
      });
    }
    cachedThumbnails = cachedGalleryUrls;
  }

  function handleClearCache() {
    gameData = null;
    cachedGameIconUrl = null;
    originalGameIconUrl = null;
    cachedThumbnails = [];
  }

  onMount(async () => {
    const cachedData = getFromCache(currentGame);
    if (cachedData && cachedData.gameType === currentGame) {
      await populateFromCache(cachedData);
    }
  });
</script>

<Navigation />
<HeroSection {currentGame} />

<div class="container">
  <GameSwitcher {currentGame} onGameSwitch={handleGameSwitch} />

  <div class="row align-items-center">
    <Gallery 
      gameIconUrl={cachedGameIconUrl} 
      originalGameIconUrl={originalGameIconUrl}
      thumbnails={cachedThumbnails} 
    />
  </div>

  <LoadingButton {loading} {buttonText} onClick={loadGameData} />

  {#if error}
    <div class="alert alert-danger d-flex align-items-center shadow-sm" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <div>
        <strong>Error occurred:</strong> {error}
      </div>
    </div>
  {/if}

  <GameDetails {gameData} />

  {#if currentGame === 'TDS'}
    <div class="card border-0 shadow-sm mt-4">
      <div class="card-body">
        <h6 class="card-title">
          <i class="bi bi-award me-2 text-warning"></i>Badges Information
        </h6>
        <p class="card-text">
          The badges player count has been integrated to the wiki, the list was moved to the 
          <a href="https://tds.fandom.com/wiki/Badges" target="_blank">Badges article</a>.
        </p>
      </div>
    </div>
  {/if}

  <!-- Settings -->
  <div class="card border-0 shadow-sm mt-4">
    <div class="card-body">
      <h6 class="card-title">
        <i class="bi bi-gear me-2"></i>Settings
      </h6>
      <Settings onClearCache={handleClearCache} />
    </div>
  </div>
</div>

<!-- Footer -->
<footer class="bg-dark text-light py-4 mt-5">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-md-6">
        <p class="mb-0">
          <i class="bi bi-exclamation-triangle me-2"></i>WE ARE NOT AFFILIATED WITH PARADOXUM GAMES.
        </p>
      </div>
      <div class="col-md-6 text-md-end">
        <a href="https://github.com/Paradoxum-Wikis/TDS-Page-Resources" class="text-light text-decoration-none">
          <i class="bi bi-github me-2"></i>View Source Code
        </a>
      </div>
    </div>
  </div>
</footer>