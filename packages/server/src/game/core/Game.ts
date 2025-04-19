import { Collision, GameEvents, getRandomColor, RoundState } from '@battle-snakes/shared';
import { DEFAULT_FOOD_COUNT, INTERMISSION_DURATION_MS, MAX_ROOM_SIZE, TICK_RATE_MS } from '../../config/gameConfig';
import { GameLoop } from './GameLoop';
import { GameState } from './GameState';
import { GameEventBus } from '../events/GameEventBus';
import { CollisionService } from '../services/CollisionService';
import { CpuPlayer } from '../domain/CpuPlayer';
import { InputBuffer } from '../input/InputBuffer';

export class Game {
  private roomId: string;
  private gameState: GameState;
  private gameLoop: GameLoop;
  private inputBuffer: InputBuffer;

  constructor(roomId: string, gridSize: number, private readonly gameEventBus: GameEventBus) {
    this.roomId = roomId;
    this.gameState = new GameState(gridSize);
    this.gameLoop = new GameLoop(() => this.tick(), TICK_RATE_MS);
    this.gameEventBus = gameEventBus;
    this.inputBuffer = new InputBuffer();
  }

  public startRoom() {
    this.gameState.beginIntermission();
    this.gameLoop.start();
    this.debug_spawnCPU(MAX_ROOM_SIZE / 2); // TODO: remove this later.
  }

  public stop() {
    this.gameLoop.stop();
  }

  // Main update loop.
  private tick(): void {
    switch (this.gameState.getRoundState()) {
      case RoundState.ACTIVE:
        this.gameLoopTick();
        break;
      case RoundState.WAITING:
      case RoundState.INTERMISSION:
        this.intermissionTick();
        break;
    }
  }

  private gameLoopTick(): void {
    // Step One: process all inputs.
    this.processInputs();

    // Step Two: update all player positions.
    this.movementTick();

    // Step Three: track all collisions that occurred after position update.
    const collisions = CollisionService.detectCollisions(this.gameState);

    // Step Four: handle collision effects on the game state...
    this.processCollisions(collisions);

    // Step Five: update the visual grid for display, send out the updated map.
    this.gameState.updateGrid();
    this.gameEventBus.emit(GameEvents.STATE_UPDATE, this.roomId, this.gameState.toSharedGameState());

    if (this.gameState.getFoodPositions().size < DEFAULT_FOOD_COUNT) {
      this.gameState.placeFood();
    }

    if (this.gameState.areAllPlayersDead()) {
      this.gameState.beginIntermission();
    }
  }

  private intermissionTick(): void {
    // If intermission time is over, set round to active and reset the intermission end time.
    if (this.gameState.isIntermissionOver()) {
      this.gameState.beginRound();
    }

    this.gameEventBus.emit(GameEvents.STATE_UPDATE, this.roomId, this.gameState.toSharedGameState());
  }

  public tryToAddPlayerToRoom(playerId: string): boolean {
    // Race condition: check if there is vacancy before trying to add a player.
    if (!this.gameState.hasVacancy()) {
      return false;
    }

    this.gameState.addPlayer(playerId);

    return true;
  }

  public removePlayerFromRoom(playerId: string) {
    this.gameState.removePlayer(playerId);
    this.inputBuffer.clearPlayer(playerId);
    this.gameEventBus.emit(GameEvents.LEADERBOARD_UPDATE, this.roomId, this.gameState.getPlayerData());
  }

  public getPlayerData() {
    return this.gameState.getPlayerData();
  }

  private movementTick() {
    const players = this.gameState.getActivePlayers();

    for (const player of players.values()) {
      if (player instanceof CpuPlayer) {
        player.chooseNextMove();
        player.updateGameState(this.gameState);
      }

      player.move();
    }
  }

  public getInputBuffer(): InputBuffer {
    return this.inputBuffer;
  }

  // Grab the inputs for the current tick, update the player's direction based off the buffer.
  private processInputs() {
    const inputs = this.inputBuffer.processInputsForTick();

    for (const input of inputs) {
      const player = this.gameState.getPlayer(input.playerId);
      if (!player || !player.isActive()) continue;

      // Input validation is done in the player class.
      player.setDirection(input.direction);
    }
  }

  public spawnFood() {
    while (this.gameState.getFoodPositions().size < DEFAULT_FOOD_COUNT) {
      const foodPoint = this.gameState.getRandomAvailablePosition();

      this.gameState.addFood(foodPoint);
    }
  }

  /**
   * Take the collisions that happened in the last tick, and update the game state accordingly.
   * @param collisions
   */
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

    const messages = CollisionService.convertCollisionsToMessages(collisions);
    if (collisions.length > 0 && messages.length > 0) {
      this.gameEventBus.emit(GameEvents.MESSAGE_EVENT, this.roomId, messages);
    }

    if (wasScoreUpdated) {
      this.gameState.placeFood();
      this.gameEventBus.emit(GameEvents.LEADERBOARD_UPDATE, this.roomId, this.gameState.getPlayerData());
    }
  }

  debug_spawnCPU(num: number) {
    for (let i = 0; i < num; i++) {
      this.gameState.addPlayer(`CPU ${i + 1}`, true);
    }
  }
}
