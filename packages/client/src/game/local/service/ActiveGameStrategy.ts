import {
  Collision,
  CollisionService,
  CpuPlayer,
  DEFAULT_FOOD_COUNT,
  GameLoop,
  GameState,
  SpawnService,
} from '@battle-snakes/shared';
import { LocalGameContext } from '../LocalGame';
import { InputBuffer } from './InputBuffer';

export class ActiveGameStrategy {
  private localPlayerId;

  private gameState: GameState;
  private inputBuffer: InputBuffer;

  private spawnService: SpawnService;

  private movementAccumulator = 0;

  constructor({ gameState, spawnService, gameConfigOptions }: LocalGameContext) {
    this.localPlayerId = gameConfigOptions.playerName;

    this.gameState = gameState;
    this.spawnService = spawnService;

    this.inputBuffer = new InputBuffer(gameState);
  }

  tick(deltaTime: number) {
    // requestAnimationFrame() is fast af. we only want to update game state after a certain amount of time has accumulated...
    // The speed of each snake is tied to the update interval.
    this.movementAccumulator += deltaTime;
    if (this.movementAccumulator < GameLoop.GAME_STATE_UPDATE_INTERVAL_MS) {
      return;
    } else {
      this.movementAccumulator -= GameLoop.GAME_STATE_UPDATE_INTERVAL_MS;
    }

    // Step One: process input
    this.handleInput();

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

      if (player instanceof CpuPlayer) {
        player.chooseNextMove(this.gameState);
      }
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

  private handleInput() {
    const input = this.inputBuffer.getNextInput();

    for (const player of this.gameState.getActivePlayers()) {
      if (input && player.getPlayerId() === this.localPlayerId) {
        player.setDirection(input);
      }
      // CPU players.
    }
  }
}
