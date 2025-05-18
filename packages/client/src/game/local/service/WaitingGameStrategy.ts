import { GameState, SpawnService } from '@battle-snakes/shared';
import { LocalGameContext } from '../LocalGame';

export class WaitingGameStrategy {
  private gameState: GameState;
  private spawnService: SpawnService;

  private haveEntitiesBeenSpawned = false;

  constructor({ gameState, spawnService }: LocalGameContext) {
    this.gameState = gameState;
    this.spawnService = spawnService;
  }

  tick(deltaTime: number) {
    if (!this.haveEntitiesBeenSpawned) {
      this.spawnService.spawnInitialFood();
      this.spawnService.spawnAllPlayers();
      this.haveEntitiesBeenSpawned = true;
    }


    
    this.gameState.updateGrid();
  }
}
