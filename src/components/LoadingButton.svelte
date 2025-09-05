<script lang="ts">
  let { 
    loading, 
    buttonText, 
    onClick 
  }: { 
    loading: boolean; 
    buttonText: string; 
    onClick: () => void; 
  } = $props();
</script>

<div class="card border-0 shadow-sm mb-4">
  <div class="card-body text-center py-4">
    <button 
      class="btn btn-lg btn-success px-5 py-3"
      onclick={onClick}
      disabled={loading}
      style="min-width: 200px;"
    >
      {#if loading}
        <div class="d-flex align-items-center justify-content-center">
          <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          My Ego is Lord Exoing
        </div>
      {:else}
        <i class="bi bi-file-earmark-arrow-down me-2"></i>
        {buttonText}
      {/if}
    </button>
    
    <div class="mt-3">
      <p class="text-muted mb-2">
        <i class="bi bi-info-circle me-2"></i>Click the button above to load the latest content
      </p>
      <p class="text-muted mb-0">
        <i class="bi bi-info-circle me-2"></i>Click on any image to download it
      </p>
    </div>
  </div>
</div>