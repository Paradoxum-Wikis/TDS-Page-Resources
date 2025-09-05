<script lang="ts">
  import type { GameType } from '../modules/types';
  
  let { currentGame }: { currentGame: GameType } = $props();
  
  const gameInfo: Record<GameType, { title: string; subtitle: string; backgroundImage: string }> = {
    TDS: {
      title: "Tower Defense Simulator",
      subtitle: "Download things to upload to the wiki xd",
      backgroundImage: "/TDSHero.png"
    },
    AE: {
      title: "ALTER EGO", 
      subtitle: "Stalk the development of ALTER EGO >:)",
      backgroundImage: "/AEHero.png"
    }
  };
</script>

<div class="hero-section py-5 mb-4 text-white position-relative overflow-hidden" 
     style="background-image: url('{gameInfo[currentGame].backgroundImage}'); background-size: cover; background-position: center; background-repeat: no-repeat;">
  <div class="hero-overlay position-absolute top-0 start-0 w-100 h-100"></div>
  
  <div class="container position-relative">
    <div class="row align-items-center">
      <div class="col-lg-8">
        <h1 class="display-4 fw-bold mb-3">
          {gameInfo[currentGame].title}
        </h1>
        <p class="lead mb-4">
          {gameInfo[currentGame].subtitle}
        </p>
      </div>
    </div>
  </div>
</div>