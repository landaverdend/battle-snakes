import { Collision, GameEvents, RoundState } from '@battle-snakes/shared';
import { DEFAULT_FOOD_COUNT, GAME_STATE_UPDATE_INTERVAL_MS, MAX_ROOM_SIZE, TICK_RATE_MS } from '../../config/gameConfig';
import { GameLoop } from './GameLoop';
import { GameState } from './GameState';
import { GameEventBus } from '../events/GameEventBus';
import { CollisionService } from '../services/CollisionService';
import { CpuPlayer } from '../domain/CpuPlayer';
import { InputBuffer } from '../input/InputBuffer';
import { SpawnService } from '../services/SpawnService';

export class Game {
  private roomId: string;
  private gameState: GameState;
  private gameLoop: GameLoop;
  private inputBuffer: InputBuffer;
  private spawnService: SpawnService;
  isCpuGame: boolean;

  private haveEntitiesBeenSpawned = false;
  private movementAccumulator = 0;

  constructor(roomId: string, gridSize: number, private readonly gameEventBus: GameEventBus, isCpuGame = false) {
    this.roomId = roomId;
    this.gameState = new GameState(gridSize);
    this.gameLoop = new GameLoop((deltaTime: number) => this.tick(deltaTime), TICK_RATE_MS);
    this.gameEventBus = gameEventBus;
    this.inputBuffer = new InputBuffer();
    this.spawnService = new SpawnService(this.gameState);

    this.isCpuGame = isCpuGame;
    if (isCpuGame) {
      this.spawnService.addCpuPlayers(MAX_ROOM_SIZE - 1);
    }
  }

  public startRoom() {
    this.gameState.beginWaiting();
    this.gameLoop.start();
  }

  public stop() {
    this.gameLoop.stop();
  }

  // Main update loop.
  private tick(deltaTime: number): void {
    switch (this.gameState.getRoundState()) {
      case RoundState.ACTIVE:
        this.gameLoopTick(deltaTime);
        break;
      case RoundState.INTERMISSION:
        this.intermissionTick();
        break;
      case RoundState.WAITING:
        this.waitingtick();
        break;
    }
  }

  private gameLoopTick(deltaTime: number): void {
    // Only update the game state at the designated interval.
    this.movementAccumulator += deltaTime;
    if (this.movementAccumulator < GAME_STATE_UPDATE_INTERVAL_MS) {
      return;
    }

    // Step One: process all inputs.
    this.processInputs();
    this.movementAccumulator -= GAME_STATE_UPDATE_INTERVAL_MS;

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
      this.spawnService.spawnFood();
    }

    if (this.gameState.shouldRoundEnd()) {
      this.gameState.beginWaiting();
      const winner = this.gameState.getActivePlayers()[0];
      this.gameEventBus.emitMessage(
        this.roomId,
        `Round ${this.gameState.getRoundNumber()} over! ${winner?.getPlayerName()} wins!`
      );
    }
  }

  private intermissionTick(): void {
    // If intermission time is over, set round to active and reset the intermission end time.
    if (this.gameState.isIntermissionOver()) {
      this.gameState.beginRound();
      this.haveEntitiesBeenSpawned = false;
    }

    // If there is only one player, back to waiting state.
    if (this.gameState.getAllPlayers().length === 1) {
      this.gameState.setRoundState(RoundState.WAITING);
    }

    this.gameState.updateGrid(); // We want to show the players spawn positions before the game starts.
    this.gameEventBus.emit(GameEvents.STATE_UPDATE, this.roomId, this.gameState.toSharedGameState());
  }

  private waitingtick(): void {
    if (!this.haveEntitiesBeenSpawned) {
      this.spawnService.spawnInitialFood();
      this.spawnService.spawnAllPlayers();
      this.haveEntitiesBeenSpawned = true;
    }

    // Switch to intermission countdown if there is more than one player.
    if (this.gameState.getAllPlayers().length > 1) {
      this.gameState.beginIntermissionCountdown();
    }

    this.gameState.updateGrid(); // We want to show the players spawn positions before the game starts.
    this.gameEventBus.emit(GameEvents.STATE_UPDATE, this.roomId, this.gameState.toSharedGameState());
  }

  public tryToAddPlayerToRoom(playerId: string, playerName: string, playerColor: string): boolean {
    // Race condition: check if there is vacancy before trying to add a player.
    if (!this.gameState.hasVacancy()) {
      return false;
    }

    const thePlayer = this.gameState.addPlayer(playerId, playerName, playerColor);
    if (this.gameState.isWaiting()) {
      this.spawnService.spawnPlayer(thePlayer);
    }

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
      this.spawnService.spawnFood();
      this.gameEventBus.emit(GameEvents.LEADERBOARD_UPDATE, this.roomId, this.gameState.getPlayerData());
    }
  }
}
