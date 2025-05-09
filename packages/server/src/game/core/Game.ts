import {
  Collision,
  COUNTDOWN_TIME,
  DEFAULT_FOOD_COUNT,
  Direction,
  GAME_STATE_UPDATE_INTERVAL_MS,
  GameEvents,
  MAX_ROOM_SIZE,
  Message,
  OverlayMessage,
  RoundState,
  TICK_RATE_MS,
} from '@battle-snakes/shared';
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
  private isRoundEnding = false;

  private countdownIntervalRef: NodeJS.Timeout | null = null;
  private countdownValue: number | null = null;

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

      case RoundState.WAITING:
        this.waitingTick();
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
      this.handleRoundEnd();
    }
  }

  // Stagger the round end by like 4 seconds so it's not so abrupt.
  private handleRoundEnd() {
    if (this.isRoundEnding) return;
    this.isRoundEnding = true;

    const roundSurvivor = this.gameState.getActivePlayers()[0];
    if (roundSurvivor) {
      roundSurvivor.addRoundSurvivalBonus();
    }

    if (this.gameState.shouldGameEnd()) {
      this.handleGameEnd();
    }
    // Normal round end.
    else {
      this.sendOverlayMessage({ type: 'round_over', message: 'Round Over!', player: roundSurvivor?.toPlayerData() });
      setTimeout(() => {
        this.gameState.beginWaiting();

        // Sometimes players can die on the same tick.
        let message = `Round ${this.gameState.getRoundNumber()} over!`;
        if (roundSurvivor) {
          message += ` ${roundSurvivor.getPlayerName()} survived round ${this.gameState.getRoundNumber()}!`;
        }

        this.sendSingularMessage(message);
      }, 2000);
    }

    this.sendLeaderboardUpdate();

    // Handle round cleanup
    this.inputBuffer.clearAll();
  }

  private handleRoundStart() {
    this.gameState.beginRound();
    this.haveEntitiesBeenSpawned = false;
    this.isRoundEnding = false;

    for (const player of this.gameState.getAllPlayers()) {
      this.gameEventBus.emit(GameEvents.CLIENT_STATUS_UPDATE, player.getPlayerId(), { isAlive: true });
    }

    this.sendLeaderboardUpdate();
  }

  private handleGameEnd() {
    let message = '';
    let overlayMessage: OverlayMessage = { type: 'game_over' };

    const highestScorers = this.gameState.calculateGameWinner();
    if (highestScorers.length === 1) {
      message = `${highestScorers[0]?.getPlayerName()} wins the game!`;
      overlayMessage.player = highestScorers[0]?.toPlayerData();
    } else {
      message = 'Tie Game!';
      overlayMessage.message = message;
    }

    // Let the players see the game over message for a few seconds...
    setTimeout(() => {
      this.gameState.resetGame();
    }, 2000);

    this.sendSingularMessage(message);
    this.sendOverlayMessage(overlayMessage);
  }

  private waitingTick(): void {
    // Spawn initial entities if they aren't there yet.
    if (!this.haveEntitiesBeenSpawned) {
      this.spawnService.spawnInitialFood();
      this.spawnService.spawnAllPlayers();
      this.haveEntitiesBeenSpawned = true;
      if (!this.isCpuGame && this.gameState.getAllPlayers().length === 1) {
        this.sendSingularMessage('Waiting for players to join...');
        this.sendOverlayMessage({ type: 'waiting', message: 'Waiting for players to join...' });
      }
    }

    // Switch to intermission countdown if there is more than one player.
    if (!this.countdownIntervalRef && this.gameState.getAllPlayers().length > 1) {
      this.beginCountdown();
    }

    this.gameState.updateGrid(); // We want to show the players spawn positions before the game starts.
    this.gameEventBus.emit(GameEvents.STATE_UPDATE, this.roomId, this.gameState.toSharedGameState());
  }

  private beginCountdown() {
    this.countdownValue = COUNTDOWN_TIME;
    this.sendOverlayMessage({ type: 'countdown', message: String(this.countdownValue) });

    this.countdownIntervalRef = setInterval(() => {
      if (this.countdownValue === null) {
        return;
      }

      this.countdownValue--;
      if (this.countdownValue > 0) {
        this.sendOverlayMessage({ type: 'countdown', message: String(this.countdownValue) });
      } else {
        this.clearCountdown();
        this.handleRoundStart();
        this.sendOverlayMessage({ type: 'clear' });
      }
    }, 1000);
  }

  private clearCountdown() {
    if (this.countdownIntervalRef) {
      clearInterval(this.countdownIntervalRef);
      this.countdownIntervalRef = null;
      this.countdownValue = null;
    }
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
    this.sendLeaderboardUpdate();

    // Clear the countdown if there was one...
    if (this.gameState.getAllPlayers().length === 1) {
      this.clearCountdown();
    }
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

  public handlePlayerInput(playerId: string, direction: Direction) {
    if (this.gameState.isActive()) this.inputBuffer.addInput(playerId, direction);
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
          this.gameEventBus.emit(GameEvents.CLIENT_STATUS_UPDATE, collision.playerId, { isAlive: false });
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
      this.sendLeaderboardUpdate();
    }
  }

  private sendSingularMessage(message: string, type: Message['type'] = 'default') {
    this.gameEventBus.emit(GameEvents.MESSAGE_EVENT, this.roomId, [{ type, message }]);
  }

  private sendLeaderboardUpdate() {
    this.gameEventBus.emit(GameEvents.LEADERBOARD_UPDATE, this.roomId, this.gameState.getPlayerData());
  }

  private sendOverlayMessage(overlayMessage: OverlayMessage) {
    this.gameEventBus.emit(GameEvents.OVERLAY_MESSAGE, this.roomId, overlayMessage);
  }
}
