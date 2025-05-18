import { Collision, CollisionService, DEFAULT_FOOD_COUNT, GameLoop, GameState, SpawnService } from '@battle-snakes/shared';
import { LocalGameContext } from '../LocalGame';

export class ActiveGameStrategy {
  private gameState: GameState;

  private spawnService: SpawnService;

  private movementAccumulator = 0;

  constructor({ gameState, spawnService }: LocalGameContext) {
    this.gameState = gameState;
    this.spawnService = spawnService;
  }

  tick(deltaTime: number) {
    // requestAnimationFrame() is fast af. we only want to update game state after a certain amount of time has accumulated...
    // The speed of each snake is tied to the update interval.
    this.movementAccumulator += deltaTime;
    if (this.movementAccumulator < GameLoop.GAME_STATE_UPDATE_INTERVAL_MS) {
      console.log('movementAccumulator', this.movementAccumulator);
      return;
    } else {
      this.movementAccumulator -= GameLoop.GAME_STATE_UPDATE_INTERVAL_MS;
    }

    // Step One: process input

    // Step Two: update player positions
    this.movementTick();

    // Step Three: detect collisions
    const collisions = CollisionService.detectCollisions(this.gameState);

    // Step Four: handle collision effects
    this.processCollisions(collisions);

    // Step Five: Resolve the grid state.
    this.gameState.updateGrid();

    if (this.gameState.getFoodPositions().size < DEFAULT_FOOD_COUNT) {
      this.spawnService.spawnFood();
    }

    // if (this.gameState.shouldRoundEnd()) {
    //   this.gameState.beginWaiting();
    // }
  }

  private movementTick() {
    const players = this.gameState.getActivePlayers();

    for (const player of players.values()) {
      player.move();
    }
  }

  private processCollisions(collisions: Collision[]) {
    let wasScoreUpdated = false;

    for (const collision of collisions) {
      switch (collision.type) {
        case 'self':
        case 'snake':
        case 'wall':
          this.gameState.killPlayer(collision.playerId);
          break;
        case 'food':
          this.gameState.removeFood(collision.point);
          this.gameState.growPlayer(collision.playerId);
          wasScoreUpdated = true;
          break;
      }
    }

    if (wasScoreUpdated) {
    }
  }
}
