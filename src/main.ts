interface RobloxCreator {
    id: number;
    name: string;
    type: string;
    isRNVAccount: boolean;
    hasVerifiedBadge: boolean;
}

interface RobloxGameData {
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
    created: string; // iso 8601 date
    updated: string; // iso 8601 date
    studioAccessToApisAllowed: boolean;
    createVipServersAllowed: boolean;
    universeAvatarType: string;
    genre: string;
    genre_l1?: string; // optional
    genre_l2?: string; // optional
    isAllGenre: boolean;
    isFavoritedByUser: boolean;
    favoritedCount: number;
}

interface RobloxGameApiResponse {
    data: RobloxGameData[];
}

// media api interfaces
interface RobloxMediaItem {
    assetTypeId: number;
    assetType: string;
    imageId: number;
    videoHash: string | null;
    videoTitle: string | null;
    approved: boolean;
    altText: string | null;
}

interface RobloxMediaApiResponse {
    data: RobloxMediaItem[];
}

// thumbnails api response interface
interface RobloxThumbnailItem {
    targetId: number;
    state: "Completed" | "Pending" | "Blocked" | "Error"; // possible states
    imageUrl: string | null; // image url if completed
}

interface RobloxThumbnailsApiResponse {
    data: RobloxThumbnailItem[];
}

// asset delivery api response interface
interface RobloxAssetLocation {
    assetFormat: string;
    location: string; // image url
}

interface RobloxAssetDeliveryResponse {
    locations?: RobloxAssetLocation[]; // optional locations
    errors?: any[];
}

// game icon api response interface
interface RobloxGameIconItem {
    targetId: number;
    state: "Completed" | "Pending" | "Blocked" | "Error";
    imageUrl: string | null;
}

interface RobloxGameIconApiResponse {
    data: RobloxGameIconItem[];
}

// cache storage interface
interface GameDataCache {
    timestamp: number;
    gameDetails: {
        id: number;
        rootPlaceId: number;
        name: string;
        developer: string;
        developerId: number;     // creator id
        developerType: string;   // creator type
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

// cache duration (24 hours)
const cacheDuration = 24 * 60 * 60 * 1000;
const cacheKey = 'tds_game_data_cache';

// save data to cache
function saveToCache(data: GameDataCache): void {
    try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
        // fail silently, add logs if ya want.
    }
}

// get data from cache
function getFromCache(): GameDataCache | null {
    try {
        const cachedData = localStorage.getItem(cacheKey);
        if (!cachedData) return null;
        
        const parsedData: GameDataCache = JSON.parse(cachedData);
        // check if cache expired
        if (Date.now() - parsedData.timestamp > cacheDuration) {
            return null;
        }
        
        return parsedData;
    } catch (error) {
        return null;
    }
}

function updateElementText(id: string, text: string): void {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = text;
}

// display stats
function updateStatText(id: string, formattedValue: string, rawValue: string | number): void {
    const element = document.getElementById(id);
    if (!element) return;
    element.innerHTML = `${formattedValue} <span class="text-muted small">(${rawValue})</span>`;
}

function setupGalleryClickHandler(container: HTMLElement): void {
    container.onclick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'IMG' && target.dataset.downloadUrl && target.dataset.downloadFilename) {
            downloadImage(target.dataset.downloadUrl, target.dataset.downloadFilename);
        }
    };
}

// common update UI function
function updateUI(data: RobloxGameData | GameDataCache, isCache: boolean = false): void {
    // get UI elements
    const titleElement = document.querySelector('.game-details h1.h3');
    const developerElement = document.querySelector('.game-details p.text-muted a') as HTMLAnchorElement | null;
    const descriptionElement = document.querySelector('.game-details h2.h5 + p');
    
    if (isCache) {
        // type guard because typescript is funny
        const cachedData = data as GameDataCache;
        
        // update game details
        if (titleElement) titleElement.textContent = cachedData.gameDetails.name;
        if (developerElement) {
            developerElement.textContent = cachedData.gameDetails.developer;
            
            // set url based on creator type
            if (cachedData.gameDetails.developerType.toLowerCase() === "user") {
                developerElement.href = `https://www.roblox.com/users/${cachedData.gameDetails.developerId}/profile`;
            } else {
                developerElement.href = `https://www.roblox.com/communities/${cachedData.gameDetails.developerId}`;
            }
            developerElement.target = "_blank";
        }
        if (descriptionElement) descriptionElement.textContent = cachedData.gameDetails.description;
        
        // update game stats
        updateStatText('active-players', formatNumber(cachedData.gameStats.activePlayers), cachedData.gameStats.activePlayers);
        updateStatText('total-visits', formatNumber(cachedData.gameStats.totalVisits), cachedData.gameStats.totalVisits);
        updateStatText('max-players', cachedData.gameStats.maxPlayers.toString(), cachedData.gameStats.maxPlayers);
        updateStatText('favorites-count', formatNumber(cachedData.gameStats.favoritesCount), cachedData.gameStats.favoritesCount);
        updateStatText('game-genre', cachedData.gameStats.genre, cachedData.gameStats.genre);
        updateStatText('created-date', formatDate(cachedData.gameStats.created), cachedData.gameStats.created);
        updateStatText('updated-date', formatDate(cachedData.gameStats.updated), cachedData.gameStats.updated);
        
        // update game attributes
        updateStatText('game-price', cachedData.gameDetails.price === null ? 'Free' : `R$ ${cachedData.gameDetails.price}`, 
                      cachedData.gameDetails.price === null ? 'null' : cachedData.gameDetails.price);
        updateStatText('avatar-type', cachedData.gameDetails.universeAvatarType, cachedData.gameDetails.universeAvatarType);
        
        const subgenres = [];
        if (cachedData.gameDetails.subgenres.genre_l1) subgenres.push(cachedData.gameDetails.subgenres.genre_l1);
        if (cachedData.gameDetails.subgenres.genre_l2) subgenres.push(cachedData.gameDetails.subgenres.genre_l2);
        updateStatText('game-subgenres', subgenres.length > 0 ? subgenres.join(', ') : 'None', 
                      `l1: ${cachedData.gameDetails.subgenres.genre_l1 || 'None'}, l2: ${cachedData.gameDetails.subgenres.genre_l2 || 'None'}`);
        
        updateStatText('allowed-gear', formatArray(cachedData.gameDetails.settings.allowedGearGenres), 
                      JSON.stringify(cachedData.gameDetails.settings.allowedGearGenres));
        updateStatText('vip-servers', formatBoolean(cachedData.gameDetails.settings.createVipServersAllowed), 
                      cachedData.gameDetails.settings.createVipServersAllowed.toString());
        updateStatText('copying-allowed', formatBoolean(cachedData.gameDetails.settings.copyingAllowed), 
                      cachedData.gameDetails.settings.copyingAllowed.toString());
        updateStatText('genre-enforced', formatBoolean(cachedData.gameDetails.settings.isGenreEnforced), 
                      cachedData.gameDetails.settings.isGenreEnforced.toString());
        
        // update creator details
        updateStatText('creator-type', cachedData.gameDetails.developerType, cachedData.gameDetails.developerType);
        updateStatText('verified-badge', formatBoolean(cachedData.gameDetails.creator.hasVerifiedBadge), 
                      cachedData.gameDetails.creator.hasVerifiedBadge.toString());
        updateStatText('rnv-account', formatBoolean(cachedData.gameDetails.creator.isRNVAccount), 
                      cachedData.gameDetails.creator.isRNVAccount.toString());
        
        // update technical details
        updateStatText('universe-id', cachedData.gameDetails.id.toString(), cachedData.gameDetails.id.toString());
        updateStatText('place-id', cachedData.gameDetails.rootPlaceId.toString(), cachedData.gameDetails.rootPlaceId.toString());
        updateStatText('api-access', formatBoolean(cachedData.gameDetails.settings.studioAccessToApisAllowed), 
                      cachedData.gameDetails.settings.studioAccessToApisAllowed.toString());
    } else { // same shit, but robloxgamedata
        const gameData = data as RobloxGameData;

        if (titleElement) titleElement.textContent = gameData.name;
        if (developerElement) {
            developerElement.textContent = gameData.creator.name;

            if (gameData.creator.type.toLowerCase() === "user") {
                developerElement.href = `https://www.roblox.com/users/${gameData.creator.id}/profile`;
            } else {
                developerElement.href = `https://www.roblox.com/communities/${gameData.creator.id}`;
            }
            developerElement.target = "_blank";
        }
        if (descriptionElement) descriptionElement.textContent = gameData.description;
        
        updateStatText('active-players', formatNumber(gameData.playing), gameData.playing);
        updateStatText('total-visits', formatNumber(gameData.visits), gameData.visits);
        updateStatText('max-players', gameData.maxPlayers.toString(), gameData.maxPlayers);
        updateStatText('favorites-count', formatNumber(gameData.favoritedCount), gameData.favoritedCount);
        updateStatText('game-genre', gameData.genre, gameData.genre);
        updateStatText('created-date', formatDate(gameData.created), gameData.created);
        updateStatText('updated-date', formatDate(gameData.updated), gameData.updated);
        
        updateStatText('game-price', gameData.price === null ? 'Free' : `R$ ${gameData.price}`, 
                      gameData.price === null ? 'null' : gameData.price);
        updateStatText('avatar-type', gameData.universeAvatarType, gameData.universeAvatarType);
        
        const subgenres = [];
        if (gameData.genre_l1) subgenres.push(gameData.genre_l1);
        if (gameData.genre_l2) subgenres.push(gameData.genre_l2);
        updateStatText('game-subgenres', subgenres.length > 0 ? subgenres.join(', ') : 'None', 
                      `l1: ${gameData.genre_l1 || 'None'}, l2: ${gameData.genre_l2 || 'None'}`);
        
        updateStatText('allowed-gear', formatArray(gameData.allowedGearGenres || []), 
                      JSON.stringify(gameData.allowedGearGenres || []));
        updateStatText('vip-servers', formatBoolean(gameData.createVipServersAllowed), 
                      gameData.createVipServersAllowed.toString());
        updateStatText('copying-allowed', formatBoolean(gameData.copyingAllowed), 
                      gameData.copyingAllowed.toString());
        updateStatText('genre-enforced', formatBoolean(gameData.isGenreEnforced), 
                      gameData.isGenreEnforced.toString());

        updateStatText('creator-type', gameData.creator.type, gameData.creator.type);
        updateStatText('verified-badge', formatBoolean(gameData.creator.hasVerifiedBadge), 
                      gameData.creator.hasVerifiedBadge.toString());
        updateStatText('rnv-account', formatBoolean(gameData.creator.isRNVAccount), 
                      gameData.creator.isRNVAccount.toString());

        updateStatText('universe-id', gameData.id.toString(), gameData.id.toString());
        updateStatText('place-id', gameData.rootPlaceId.toString(), gameData.rootPlaceId.toString());
        updateStatText('api-access', formatBoolean(gameData.studioAccessToApisAllowed), 
                      gameData.studioAccessToApisAllowed.toString());
    }
}

// populate ui from cache
function populateUIFromCache(cache: GameDataCache): void {
    // get ui elements
    const gameIconElement = document.querySelector('.game-icon img') as HTMLImageElement | null;
    const galleryContainer = document.querySelector('.thumbnail-gallery .d-flex');
    
    // update game icon and add download listener
    if (gameIconElement && cache.gameIconUrl) {
        gameIconElement.src = cache.gameIconUrl;
        gameIconElement.alt = "Tower Defense Simulator Game Icon";
        gameIconElement.style.cursor = 'pointer';
        gameIconElement.onclick = () => {
            if (cache.gameIconUrl) {
                downloadImage(cache.gameIconUrl, 'game-icon');
            }
        };
    }

    // update gallery and add download listener (event delegation)
    const htmlGalleryContainer = galleryContainer as HTMLElement | null;
    if (htmlGalleryContainer) {
        htmlGalleryContainer.innerHTML = ''; // clear placeholders
        
        if (cache.galleryUrls.length > 0) {
            cache.galleryUrls.forEach((item, index) => {
                const img = document.createElement('img');
                img.src = item.url;
                img.alt = item.alt;
                img.classList.add('img-fluid', 'rounded25', 'me-2', 'mb-2');
                img.dataset.downloadUrl = item.url;
                img.dataset.downloadFilename = `thumbnail-${index + 1}`;
                htmlGalleryContainer.appendChild(img);
            });
            
            // add click listener to container
            setupGalleryClickHandler(htmlGalleryContainer);
        } else {
            htmlGalleryContainer.innerHTML = '<p class="text-muted">no thumbnails available.</p>';
            htmlGalleryContainer.onclick = null; // remove listener if empty
        }
    }
    
    // update all the UI elements with data from cache
    updateUI(cache, true);
}

// formatting helpers
function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return num.toString();
    }
}

function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateString; // return original if formatting fails
    }
}

// format boolean values as yes/no
function formatBoolean(value: boolean): string {
    return value ? 'Yes' : 'No';
}

// format array as comma-separated string
function formatArray(arr: any[]): string {
    if (!arr || arr.length === 0) return 'None';
    return arr.join(', ');
}

// fetch game data and update page
async function fetchGameDataAndUpdatePage(): Promise<void> {
    const placeId = '3260590327'; 
    const universeId = '1176784616';
    const gameApiUrl = `https://games.roproxy.com/v1/games?universeIds=${universeId}`;
    const mediaApiUrl = `https://games.roproxy.com/v2/games/${universeId}/media?fetchAllExperienceRelatedMedia=true`;
    const gameIconApiUrl = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeId}&size=512x512&format=Png&isCircular=false`;
    
    // select ui elements
    const loadButton = document.getElementById('loadGameDataBtn') as HTMLButtonElement | null;
    const loadingIndicator = document.getElementById('loadingIndicator');
    const gameIconElement = document.querySelector('.game-icon img') as HTMLImageElement | null;
    const galleryContainer = document.querySelector('.thumbnail-gallery .d-flex');
    const titleElement = document.querySelector('.game-details h1.h3');
    const developerElement = document.querySelector('.game-details p.text-muted a') as HTMLAnchorElement | null;
    const descriptionElement = document.querySelector('.game-details h2.h5 + p');
    const detailsContainer = document.querySelector('.game-details');

    if (loadButton) loadButton.disabled = true;
    if (loadingIndicator) loadingIndicator.style.display = 'block';

    // prepare cache object
    const cacheData: GameDataCache = {
        timestamp: Date.now(),
        gameDetails: {
            id: 0,
            rootPlaceId: 0,
            name: '',
            developer: '',
            developerId: 0,
            developerType: '',
            description: '',
            price: null,
            universeAvatarType: '',
            subgenres: {
                genre_l1: null,
                genre_l2: null,
                isAllGenre: false
            },
            settings: {
                allowedGearGenres: [],
                allowedGearCategories: [],
                isGenreEnforced: false,
                copyingAllowed: false,
                createVipServersAllowed: false,
                studioAccessToApisAllowed: false
            },
            creator: {
                hasVerifiedBadge: false,
                isRNVAccount: false
            }
        },
        gameStats: {
            activePlayers: 0,
            totalVisits: 0,
            maxPlayers: 0,
            favoritesCount: 0,
            genre: '',
            created: '',
            updated: '',
            isFavoritedByUser: false
        },
        gameIconUrl: null,
        galleryUrls: []
    };

    try {
        // fetch game icon first
        try {
            const proxyIconUrl = `https://occulticnine.vercel.app/?url=${encodeURIComponent(gameIconApiUrl)}`;
            const iconResponse = await fetch(proxyIconUrl);
            
            if (iconResponse.ok) {
                const iconResult: RobloxGameIconApiResponse = await iconResponse.json();
                if (iconResult.data && iconResult.data.length > 0 && 
                    iconResult.data[0].state === "Completed" && 
                    iconResult.data[0].imageUrl) {
                    
                    if (gameIconElement) {
                        gameIconElement.src = iconResult.data[0].imageUrl;
                        gameIconElement.alt = "Tower Defense Simulator Game Icon";
                        cacheData.gameIconUrl = iconResult.data[0].imageUrl;
                        // add download listener for icon
                        gameIconElement.style.cursor = 'pointer';
                        gameIconElement.onclick = () => {
                            if (cacheData.gameIconUrl) {
                                downloadImage(cacheData.gameIconUrl, 'game-icon');
                            }
                        };
                    }
                }
            }
        } catch (iconError) {
            // silent fail, again add them logs in if ya need it for your fork
        }

        // fetch game data
        const gameResponse = await fetch(gameApiUrl);
        if (!gameResponse.ok) {
            throw new Error(`http error fetching game data! status: ${gameResponse.status}`);
        }
        
        const gameResult: RobloxGameApiResponse = await gameResponse.json();

        if (gameResult.data && gameResult.data.length > 0) {
            const gameData = gameResult.data[0];

            // update all the UI elements with API data
            updateUI(gameData, false);

            // save basic details to cache
            cacheData.gameDetails.id = gameData.id;
            cacheData.gameDetails.rootPlaceId = gameData.rootPlaceId;
            cacheData.gameDetails.name = gameData.name;
            cacheData.gameDetails.developer = gameData.creator.name;
            cacheData.gameDetails.developerId = gameData.creator.id;
            cacheData.gameDetails.developerType = gameData.creator.type;
            cacheData.gameDetails.description = gameData.description;
            cacheData.gameDetails.price = gameData.price;
            cacheData.gameDetails.universeAvatarType = gameData.universeAvatarType;
            
            // save subgenres to cache
            cacheData.gameDetails.subgenres.genre_l1 = gameData.genre_l1 || null;
            cacheData.gameDetails.subgenres.genre_l2 = gameData.genre_l2 || null;
            cacheData.gameDetails.subgenres.isAllGenre = gameData.isAllGenre;
            
            // save settings to cache
            cacheData.gameDetails.settings.allowedGearGenres = gameData.allowedGearGenres || [];
            cacheData.gameDetails.settings.allowedGearCategories = gameData.allowedGearCategories || [];
            cacheData.gameDetails.settings.isGenreEnforced = gameData.isGenreEnforced;
            cacheData.gameDetails.settings.copyingAllowed = gameData.copyingAllowed;
            cacheData.gameDetails.settings.createVipServersAllowed = gameData.createVipServersAllowed;
            cacheData.gameDetails.settings.studioAccessToApisAllowed = gameData.studioAccessToApisAllowed;
            
            // save creator details to cache
            cacheData.gameDetails.creator.hasVerifiedBadge = gameData.creator.hasVerifiedBadge;
            cacheData.gameDetails.creator.isRNVAccount = gameData.creator.isRNVAccount;
            
            // save game stats to cache
            cacheData.gameStats.activePlayers = gameData.playing;
            cacheData.gameStats.totalVisits = gameData.visits;
            cacheData.gameStats.maxPlayers = gameData.maxPlayers;
            cacheData.gameStats.favoritesCount = gameData.favoritedCount;
            cacheData.gameStats.genre = gameData.genre;
            cacheData.gameStats.created = gameData.created;
            cacheData.gameStats.updated = gameData.updated;
            cacheData.gameStats.isFavoritedByUser = gameData.isFavoritedByUser;

            // fetch and update media like thumbnails
            const galleryUrls: Array<{url: string; alt: string}> = [];
            await fetchGameMedia(mediaApiUrl, galleryContainer, galleryUrls, gameData.name);
            cacheData.galleryUrls = galleryUrls;

            saveToCache(cacheData);

        } else if (detailsContainer) { // handle no game data found
            detailsContainer.innerHTML = '<p class="text-danger">failed to load game data.</p>';
            if (galleryContainer) galleryContainer.innerHTML = '<p class="text-muted">could not load thumbnails.</p>';
            if (gameIconElement instanceof HTMLImageElement) gameIconElement.src = ''; // clear icon
        }

    } catch (error) { // general fetch errors
        if (detailsContainer) {
             const errorP = document.createElement('p');
             errorP.classList.add('text-danger');
             errorP.textContent = `an error occurred: ${error instanceof Error ? error.message : 'unknown error'}`;
             detailsContainer.prepend(errorP);
        }
         if (galleryContainer) galleryContainer.innerHTML = '<p class="text-muted">could not load thumbnails due to an error.</p>';
         if (gameIconElement instanceof HTMLImageElement) gameIconElement.src = '';
    } finally {
        // hide loading state
        if (loadButton) loadButton.disabled = false;
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

// extract media fetching into a separate function
async function fetchGameMedia(
    mediaApiUrl: string, 
    galleryContainer: Element | null, 
    galleryUrls: Array<{url: string; alt: string}>, 
    gameName: string
): Promise<void> {
    try {
        const mediaResponse = await fetch(mediaApiUrl);
        if (!mediaResponse.ok) {
            if (galleryContainer) galleryContainer.innerHTML = '<p class="text-muted">could not load thumbnails.</p>';
            return;
        }

        const mediaResult: RobloxMediaApiResponse = await mediaResponse.json();
        if (mediaResult.data && mediaResult.data.length > 0) {
            const imageItems = mediaResult.data.filter(item => item.assetType === 'Image' && item.approved);

            if (imageItems.length > 0) {
                const htmlGalleryContainer = galleryContainer as HTMLElement | null;
                if (htmlGalleryContainer) {
                    htmlGalleryContainer.innerHTML = ''; // clear placeholders

                    const galleryImagePromises = imageItems.map(async (item, index) => {
                        const imageUrl = await getImageUrlFromAssetDelivery(item.imageId);

                        if (imageUrl) {
                            const img = document.createElement('img');
                            img.src = imageUrl;
                            const altText = item.altText || `${gameName} thumbnail ${index + 1}`;
                            img.alt = altText;
                            img.classList.add('img-fluid', 'rounded25', 'me-2', 'mb-2');
                            img.dataset.downloadUrl = imageUrl;
                            img.dataset.downloadFilename = `thumbnail-${index + 1}`;
                            
                            galleryUrls.push({
                                url: imageUrl,
                                alt: altText
                            });
                            
                            return img;
                        } else {
                            return null; // skip if url fetch failed
                        }
                    });

                    const galleryImages = await Promise.all(galleryImagePromises);
                    galleryImages.forEach(img => {
                        if (img && htmlGalleryContainer) {
                            htmlGalleryContainer.appendChild(img);
                        }
                    });

                    setupGalleryClickHandler(htmlGalleryContainer);
                }
            } else if (galleryContainer) {
                galleryContainer.innerHTML = '<p class="text-muted">no thumbnails available.</p>';
            }
        } else if (galleryContainer) {
            galleryContainer.innerHTML = '<p class="text-muted">could not load thumbnails.</p>';
        }
    } catch {
        if (galleryContainer) {
            galleryContainer.innerHTML = '<p class="text-muted">could not load thumbnails due to an error.</p>';
        }
    }
}

// helper to get final image url, extracted from the fetchGameMedia function
async function getImageUrlFromAssetDelivery(imageId: number): Promise<string | null> {
    const targetUrl = `https://assetdelivery.roblox.com/v2/assetId/${imageId}`;
    const proxyApiUrl = `https://occulticnine.vercel.app/?url=${encodeURIComponent(targetUrl)}`;
    try {
        const response = await fetch(proxyApiUrl);
        if (!response.ok) return null;
        
        const result: RobloxAssetDeliveryResponse = await response.json();
        if (result.locations && result.locations.length > 0 && result.locations[0].location) {
            return result.locations[0].location;
        }
        return null;
    } catch {
        return null; // silent fail
    }
}

// page initialization
function initialize(): void {
    // load from cache first
    const cachedData = getFromCache();
    
    if (cachedData) {
        // use cached data if valid
        populateUIFromCache(cachedData);
    }
    
    // button listener for manual refresh
    const loadButton = document.getElementById('loadGameDataBtn');
    if (loadButton) {
        loadButton.addEventListener('click', fetchGameDataAndUpdatePage);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// trigger image download
async function downloadImage(imageUrl: string, filename: string): Promise<void> {
    try {
        // fetch image as blob
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();

        // create temp link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);

        // put png at the end of file
        const finalFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
        link.download = finalFilename;

        // click link to trigger download
        document.body.appendChild(link);
        link.click();

        // cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (error) {
        alert(`could not download image: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
}