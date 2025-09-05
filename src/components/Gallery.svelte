<script lang="ts">
  import { downloadImage } from '../modules/downloader';
  
  let { 
    gameIconUrl, 
    thumbnails
  }: { 
    gameIconUrl: string | null; 
    thumbnails: Array<{ url: string; alt: string; }>; 
  } = $props();

  async function handleGameIconClick() {
    if (!gameIconUrl) return;
    
    try {
      const hdUrl = gameIconUrl.replace("/512x512/", "/1024x1024/").replace("/512/512/", "/1024/1024/");
      await downloadImage(hdUrl, 'game-icon-hd');
    } catch (error) {
      console.warn('HD download failed, falling back to original:', error);
      try {
        await downloadImage(gameIconUrl, 'game-icon');
      } catch (fallbackError) {
        console.error('Both HD and original download failed:', fallbackError);
        alert('Failed to download game icon');
      }
    }
  }

  function handleThumbnailClick(url: string, alt: string) {
    downloadImage(url, alt.replace(/\s+/g, '-').toLowerCase());
  }

  function handleKeydown(event: KeyboardEvent, callback: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }

  const displayThumbnails = $derived(
    thumbnails.length > 0 ? thumbnails : Array.from({ length: 6 }, (_, i) => ({
      url: '/Placeholder.png',
      alt: `Thumbnail ${i + 1}`
    }))
  );
</script>

<div class="col-lg-4">
  <!-- Icon Card -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-dark bg-gradient text-white">
      <h5 class="mb-0">
        <i class="bi bi-image me-2"></i>Game Icon
      </h5>
    </div>
    <div class="card-body text-center">
      <div
        role="button"
        tabindex="0"
        class="game-icon-wrapper position-relative overflow-hidden"
        onclick={handleGameIconClick}
        onkeydown={(e) => handleKeydown(e, handleGameIconClick)}
        title={gameIconUrl ? 'Click to download full size game icon' : 'No game icon available'}
      >
        <img 
          src={gameIconUrl || "https://pbs.twimg.com/media/Fba0rk0XEAEn8Ix.jpg"} 
          alt="Game Icon" 
          class="rounded25"
          style="max-width: 200px; pointer-events: none;"
        />
        <div class="game-icon-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <i class="bi bi-download text-info fs-2"></i>
        </div>
      </div>
      <p class="text-muted small mt-2 mb-0"><i class="bi bi-info-circle me-2"></i>The download will fetch the highest possible resolution available.</p>
    </div>
  </div>
</div>

<div class="col-lg-8">
  <!-- Gallery Card -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-dark bg-gradient text-white d-flex justify-content-between align-items-center">
      <h5 class="mb-0">
        <i class="bi bi-images me-2"></i>Thumbnails
      </h5>
      <span class="badge bg-light text-dark">
        {displayThumbnails.length} images
      </span>
    </div>
    <div class="card-body">
      <div class="row g-3">
        {#each displayThumbnails as thumbnail, index}
          <div class="col-6 col-md-4 col-xl-3">
            <div class="thumbnail-card">
              <div
                role="button"
                tabindex="0"
                class="thumbnail-wrapper position-relative overflow-hidden"
                onclick={() => handleThumbnailClick(thumbnail.url, thumbnail.alt)}
                onkeydown={(e) => handleKeydown(e, () => handleThumbnailClick(thumbnail.url, thumbnail.alt))}
                title="Click to download image"
              >
                <img
                  src={thumbnail.url}
                  alt={thumbnail.alt}
                  class="img-fluid h-75 thumbnail-img"
                  style="pointer-events: none; aspect-ratio: 1; object-fit: cover;"
                />
                <div class="thumbnail-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                  <i class="bi bi-download text-info fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
      
      {#if displayThumbnails.length === 6}
        <div class="text-center mt-3">
          <small class="text-muted">
            <i class="bi bi-info-circle me-2"></i>Showing placeholder images. Load game data to see actual thumbnails.
          </small>
        </div>
      {/if}
    </div>
  </div>
</div>