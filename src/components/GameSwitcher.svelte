<script lang="ts">
  import type { GameType } from '../modules/types';
  
  let { 
    currentGame, 
    onGameSwitch 
  }: { 
    currentGame: GameType; 
    onGameSwitch: (game: GameType) => void; 
  } = $props();

  const games = [
    { 
      key: 'TDS' as GameType, 
      name: 'Tower Defense Simulator', 
      icon: 'bi-building',
      color: 'info'
    },
    { 
      key: 'AE' as GameType, 
      name: 'ALTER EGO', 
      icon: 'bi-person-circle',
      color: 'danger'
    }
  ];
</script>

<div class="card border-0 shadow-sm mb-4">
  <div class="card-body">
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div>
        <h5 class="card-title mb-1">
          <i class="bi bi-joystick me-2 text-primary"></i>
          Select Game
        </h5>
        <p class="card-text text-muted small mb-0">Choose which game's resources to view</p>
      </div>
      
      <div class="btn-group" role="group" aria-label="Game selection">
        {#each games as game}
          <input 
            type="radio" 
            class="btn-check" 
            name="game-radio"
            id="game-{game.key}"
            autocomplete="off"
            checked={currentGame === game.key}
            onchange={() => onGameSwitch(game.key)}
          />
          <label 
            class="btn btn-outline-{game.color} d-flex align-items-center gap-2" 
            for="game-{game.key}"
          >
            <i class="{game.icon}"></i>
            <span class="d-none d-sm-inline">{game.name}</span>
            <span class="d-sm-none">{game.key}</span>
          </label>
        {/each}
      </div>
    </div>
  </div>
</div>