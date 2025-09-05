<script lang="ts">
  import { clearImageCache } from '../modules/imageCache';
  import { clearCache } from '../modules/cacheManage';

  let { onClearCache }: { onClearCache: () => void } = $props();

  async function clearAllCaches() {
    if (confirm('Clear all cached data and images? This will free up storage space but images will need to be re-downloaded. Cache only lasts for 24 hours anyway.')) {
      try {
        await clearImageCache();
        clearCache();
        onClearCache();
        console.log('[imageCache] All caches cleared');
      } catch (error) {
        console.error('[imageCache] Failed to clear caches:', error);
        alert('Failed to clear cache. Please try again.');
      }
    }
  }
</script>

<button class="btn btn-outline-danger btn-sm" onclick={clearAllCaches}>
  <i class="bi bi-trash me-2"></i>Clear Cache
</button>