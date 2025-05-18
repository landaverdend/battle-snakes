import { Collision, CollisionService, DEFAULT_FOOD_COUNT, GameLoop, GameState, SpawnService } from '@battle-snakes/shared';
import { NetworkGameContext } from './NetworkGame';
import { RoundService } from '../services/RoundService';
import { MessageDispatchService } from '../services/MessageDispatchService';
import { InputBuffer } from '../input/InputBuffer';

export class ActiveGameStrategy {
  private movementAccumulator = 0;

  private gameState: GameState;

  private roundService: RoundService;
  private messageDispatchService: MessageDispatchService;
  private spawnService: SpawnService;

  private inputBuffer: InputBuffer;

  constructor(
    { gameState, messageDispatchService, inputBuffer }: NetworkGameContext,
    roundService: RoundService,
    spawnService: SpawnService
  ) {
    this.gameState = gameState;

    this.roundService = roundService;
    this.messageDispatchService = messageDispatchService;
    this.spawnService = spawnService;
    this.inputBuffer = inputBuffer;
  }

  tick(deltaTime: number) {
    // Only update the game state at the designated interval.
    this.movementAccumulator += deltaTime;
    if (this.movementAccumulator < GameLoop.GAME_STATE_UPDATE_INTERVAL_MS) {
      return;
    }

    // Step One: process all inputs.
    this.handleRoomInput();
    this.movementAccumulator -= GameLoop.GAME_STATE_UPDATE_INTERVAL_MS;

    // Step Two: update all player positions.
    this.movementTick();

    // Step Three: track all collisions that occurred after position update.
    const collisions = CollisionService.detectCollisions(this.gameState);

    // Step Four: handle collision effects on the game state...
    this.processCollisions(collisions);

    // Step Five: update the visual grid for display, send out the updated map.
    this.gameState.updateGrid();
    this.messageDispatchService.sendGameStateUpdate();

    if (this.gameState.getFoodPositions().size < DEFAULT_FOOD_COUNT) {
      this.spawnService.spawnFood();
    }

    if (this.gameState.shouldRoundEnd()) {
      this.roundService.onRoundEnd();
    }
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
          this.messageDispatchService.sendClientSpecificData(collision.playerId, { isAlive: false });
          break;
        case 'food':
          this.gameState.removeFood(collision.point);
          this.gameState.growPlayer(collision.playerId);
          wasScoreUpdated = true;
          break;
      }
    }

    if (wasScoreUpdated) {
      this.messageDispatchService.sendLeaderboardUpdate();
    }
  }

  private handleRoomInput(): void {
    const inputs = this.inputBuffer.processInputsForTick();

    for (const input of inputs) {
      const player = this.gameState.getPlayer(input.playerId);
      if (!player || !player.isActive()) continue;

      // Input validation is done in the player class.
      player.setDirection(input.direction);
    }
  }
}
