<script lang="ts">
  import type { GameDataCache } from '../modules/types';
  import { formatNumber, formatDate, formatBoolean, formatArray } from '../modules/formatter';
  
  let { gameData }: { gameData: GameDataCache | null } = $props();

  const gameTitle = $derived(gameData?.gameDetails.name || 'Game Title Placeholder');
  const developer = $derived(gameData?.gameDetails.developer || 'Developer Name');
  const description = $derived(gameData?.gameDetails.description || 'This is the game description area. Lorem ipsum dolor sit amet, consectetur adipiscing elit. THERE IS NO DATA BASICALLY.');

  const developerLink = $derived(
    !gameData
      ? "#"
      : gameData.gameDetails.developerType.toLowerCase() === "user"
      ? `https://www.roblox.com/users/${gameData.gameDetails.developerId}/profile`
      : `https://www.roblox.com/communities/${gameData.gameDetails.developerId}`
  );

  const formattedStats = $derived(gameData ? {
    activePlayers: formatNumber(gameData.gameStats.activePlayers),
    totalVisits: formatNumber(gameData.gameStats.totalVisits),
    favoritesCount: formatNumber(gameData.gameStats.favoritesCount),
    created: formatDate(gameData.gameStats.created),
    updated: formatDate(gameData.gameStats.updated),
    price: gameData.gameDetails.price === null ? "Free" : `R$ ${gameData.gameDetails.price}`,
    vipServers: formatBoolean(gameData.gameDetails.settings.createVipServersAllowed),
    copyingAllowed: formatBoolean(gameData.gameDetails.settings.copyingAllowed),
    allowedGear: formatArray(gameData.gameDetails.settings.allowedGearGenres),
    genreEnforced: formatBoolean(gameData.gameDetails.settings.isGenreEnforced),
    verifiedBadge: formatBoolean(gameData.gameDetails.creator.hasVerifiedBadge),
    rnvAccount: formatBoolean(gameData.gameDetails.creator.isRNVAccount),
    apiAccess: formatBoolean(gameData.gameDetails.settings.studioAccessToApisAllowed)
  } : null);

  const formattedSubgenres = $derived.by(() => {
    if (!gameData) return "None";
    
    const subgenres = [];
    const genre_l1 = gameData.gameDetails.subgenres.genre_l1;
    const genre_l2 = gameData.gameDetails.subgenres.genre_l2;

    if (genre_l1 && genre_l1 !== "All") subgenres.push(genre_l1);
    if (genre_l2 && genre_l2 !== "All") subgenres.push(genre_l2);
    
    return subgenres.length > 0 ? subgenres.join(", ") : "None";
  });
</script>

<div class="col">
  <div class="general p-4 my-3">
    <h1 class="h3 mb-2">{gameTitle}</h1>
    <p class="text-muted mb-3">
      By <a href={developerLink} target="_blank" class="text-decoration-none">{developer}</a>
    </p>
    <hr />
    <h2 class="h5 mt-3">About</h2>
    <p>{description}</p>

    {#if gameData && formattedStats}
      <h2 class="h5 mt-4 text-center">
        Please note that starting from this point, some details may be wrong
        since it doesn't take into account of Universes or Places inside the
        game.
      </h2>

      <!-- Game Stats Section -->
      <h2 class="h5 mt-4">Game Stats</h2>
      <div class="game-stats">
        <table class="table table-sm">
          <tbody>
            <tr>
              <td><i class="bi bi-people-fill me-2"></i>Active Players:</td>
              <td>
                {formattedStats.activePlayers} 
                <span class="text-muted small">({gameData.gameStats.activePlayers})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-eye-fill me-2"></i>Total Visits:</td>
              <td>
                {formattedStats.totalVisits} 
                <span class="text-muted small">({gameData.gameStats.totalVisits})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-person-check-fill me-2"></i>Max Players:</td>
              <td>
                {gameData.gameStats.maxPlayers} 
                <span class="text-muted small">({gameData.gameStats.maxPlayers})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-heart-fill me-2"></i>Favorites:</td>
              <td>
                {formattedStats.favoritesCount} 
                <span class="text-muted small">({gameData.gameStats.favoritesCount})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-tag-fill me-2"></i>Genre:</td>
              <td>
                {gameData.gameStats.genre} 
                <span class="text-muted small">({gameData.gameStats.genre})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-calendar-event me-2"></i>Created:</td>
              <td>
                {formattedStats.created} 
                <span class="text-muted small">({gameData.gameStats.created})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-calendar-check me-2"></i>Last Updated:</td>
              <td>
                {formattedStats.updated} 
                <span class="text-muted small">({gameData.gameStats.updated})</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Game Attributes Section -->
      <h2 class="h5 mt-4">Game Attributes</h2>
      <div class="game-attributes">
        <table class="table table-sm">
          <tbody>
            <tr>
              <td><i class="bi bi-currency-dollar me-2"></i>Price:</td>
              <td>
                {formattedStats.price}
                <span class="text-muted small">({gameData.gameDetails.price === null ? "null" : gameData.gameDetails.price})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-person-bounding-box me-2"></i>Avatar Type:</td>
              <td>
                {gameData.gameDetails.universeAvatarType}
                <span class="text-muted small">({gameData.gameDetails.universeAvatarType})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-tags me-2"></i>Subgenres:</td>
              <td>
                {formattedSubgenres}
                <span class="text-muted small">(l1: {gameData?.gameDetails.subgenres.genre_l1 || "None"}, l2: {gameData?.gameDetails.subgenres.genre_l2 || "None"})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-crosshair me-2"></i>Allowed Gear:</td>
              <td>
                {formattedStats.allowedGear}
                <span class="text-muted small">({JSON.stringify(gameData.gameDetails.settings.allowedGearGenres)})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-joystick me-2"></i>VIP Servers:</td>
              <td>
                {formattedStats.vipServers}
                <span class="text-muted small">({gameData.gameDetails.settings.createVipServersAllowed})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-clipboard me-2"></i>Copying Allowed:</td>
              <td>
                {formattedStats.copyingAllowed}
                <span class="text-muted small">({gameData.gameDetails.settings.copyingAllowed})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-shield-check me-2"></i>Genre Enforced:</td>
              <td>
                {formattedStats.genreEnforced}
                <span class="text-muted small">({gameData.gameDetails.settings.isGenreEnforced})</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Creator Details Section -->
      <h2 class="h5 mt-4">Creator Details</h2>
      <div class="creator-details">
        <table class="table table-sm">
          <tbody>
            <tr>
              <td><i class="bi bi-person-badge me-2"></i>Creator Type:</td>
              <td>
                {gameData.gameDetails.developerType}
                <span class="text-muted small">({gameData.gameDetails.developerType})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-patch-check me-2"></i>Verified Badge:</td>
              <td>
                {formattedStats.verifiedBadge}
                <span class="text-muted small">({gameData.gameDetails.creator.hasVerifiedBadge})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-shield me-2"></i>RNV Account:</td>
              <td>
                {formattedStats.rnvAccount}
                <span class="text-muted small">({gameData.gameDetails.creator.isRNVAccount})</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tech Details Section -->
      <h2 class="h5 mt-4">Technical Details</h2>
      <div class="technical-details">
        <table class="table table-sm">
          <tbody>
            <tr>
              <td><i class="bi bi-hash me-2"></i>Universe ID:</td>
              <td>
                {gameData.gameDetails.id}
                <span class="text-muted small">({gameData.gameDetails.id})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-hash me-2"></i>Place ID:</td>
              <td>
                {gameData.gameDetails.rootPlaceId}
                <span class="text-muted small">({gameData.gameDetails.rootPlaceId})</span>
              </td>
            </tr>
            <tr>
              <td><i class="bi bi-code-square me-2"></i>API Access:</td>
              <td>
                {formattedStats.apiAccess}
                <span class="text-muted small">({gameData.gameDetails.settings.studioAccessToApisAllowed})</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>