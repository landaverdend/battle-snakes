import {
  Collision,
  COUNTDOWN_TIME,
  DEFAULT_FOOD_COUNT,
  Direction,
  Game,
  GameEvents,
  GameLoop,
  GameMessage,
  OverlayMessage,
  RoundState,
} from '@battle-snakes/shared';
import { GameEventBus } from '../events/GameEventBus';
import { InputBuffer } from '../input/InputBuffer';
import { CollisionService } from '@battle-snakes/shared/src/services/CollisionService';

export type NetworkGameConfig = {
  roomId: string;
  gridSize: number;
  gameEventBus: GameEventBus;
};

export class NetworkGame extends Game {
  private roomId: string;
  private gameEventBus: GameEventBus;
  private inputBuffer: InputBuffer;

  private haveEntitiesBeenSpawned = false;
  private movementAccumulator = 0;
  private isRoundEnding = false;

  private countdownIntervalRef: NodeJS.Timeout | null = null;
  private countdownValue: number | null = null;

  constructor({ roomId, gridSize, gameEventBus }: NetworkGameConfig) {
    super(gridSize);

    this.roomId = roomId;
    this.gameEventBus = gameEventBus;
    this.inputBuffer = new InputBuffer(gameEventBus);
  }

  override tick(deltaTime: number): void {
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
    this.gameEventBus.emit(GameEvents.STATE_UPDATE, this.roomId, this.gameState.toSharedGameState());

    if (this.gameState.getFoodPositions().size < DEFAULT_FOOD_COUNT) {
      this.spawnService.spawnFood();
    }

    if (this.gameState.shouldRoundEnd()) {
      this.onRoundEnd();
    }
  }

  private movementTick() {
    const players = this.gameState.getActivePlayers();

    for (const player of players.values()) {
      player.move();
    }
  }

  private waitingTick(): void {
    // Spawn initial entities if they aren't there yet.
    if (!this.haveEntitiesBeenSpawned) {
      this.spawnService.spawnInitialFood();
      this.spawnService.spawnAllPlayers();
      this.haveEntitiesBeenSpawned = true;
      if (this.gameState.getAllPlayers().length === 1) {
        this.sendDefaultMessage('Waiting for players to join...');
        this.sendOverlayMessage({ type: 'waiting', message: 'Waiting for players to join...' });
      }

      // This is bad.
      this.gameState.getAllPlayers().forEach((p) =>
        this.gameEventBus.emit(GameEvents.CLIENT_SPECIFIC_DATA, p.getPlayerId(), {
          isAlive: false,
          spawnPoint: p.getHead(),
        })
      );
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
        this.onRoundStart();
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

  /**
   * TODO: maybe move this to an InputService class
   */
  protected handleRoomInput(): void {
    const inputs = this.inputBuffer.processInputsForTick();

    for (const input of inputs) {
      const player = this.gameState.getPlayer(input.playerId);
      if (!player || !player.isActive()) continue;

      // Input validation is done in the player class.
      player.setDirection(input.direction);
    }
  }

  public handleSingularPlayerInput(playerId: string, direction: Direction) {
    if (this.gameState.isActive()) {
      this.inputBuffer.addInput(playerId, direction);
    }
  }

  public override start(): void {
    this.gameState.beginWaiting();
    this.gameLoop.start();
  }

  public override stop(): void {
    throw new Error('Method not implemented.');
  }

  public getPlayerData() {
    return this.gameState.getPlayerData();
  }

  public tryToAddPlayerToRoom(playerId: string, playerName: string, playerColor: string): boolean {
    // Race condition: check if there is vacancy before trying to add a player.
    if (!this.gameState.hasVacancy()) {
      return false;
    }

    const thePlayer = this.gameState.addPlayer(playerId, playerName, playerColor);
    if (this.gameState.isWaiting()) {
      this.spawnService.spawnPlayer(thePlayer);
      this.gameEventBus.emit(GameEvents.CLIENT_SPECIFIC_DATA, thePlayer.getPlayerId(), {
        isAlive: false,
        spawnPoint: thePlayer.getHead(),
      });
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
      this.sendOverlayMessage({ type: 'waiting', message: 'Waiting for players to join...' });
    }
    this.spawnService.handlePlayerRemoval();
  }

  private processCollisions(collisions: Collision[]) {
    let wasScoreUpdated = false;

    for (const collision of collisions) {
      switch (collision.type) {
        case 'self':
        case 'snake':
        case 'wall':
          this.gameState.killPlayer(collision.playerId);
          this.gameEventBus.emit(GameEvents.CLIENT_SPECIFIC_DATA, collision.playerId, { isAlive: false });
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

  /****************************************/
  /***********ROUND HANDLING STUFF ********/
  /****************************************/
  override onRoundStart() {
    this.gameState.beginRound();
    this.haveEntitiesBeenSpawned = false;
    this.isRoundEnding = false;

    for (const player of this.gameState.getAllPlayers()) {
      this.gameEventBus.emit(GameEvents.CLIENT_SPECIFIC_DATA, player.getPlayerId(), {
        isAlive: true,
      });
    }

    this.sendLeaderboardUpdate();
  }

  // Stagger the round end by like 4 seconds so it's not so abrupt.
  override onRoundEnd() {
    if (this.isRoundEnding) return;
    this.isRoundEnding = true;

    const roundSurvivor = this.gameState.getActivePlayers()[0];
    if (roundSurvivor) {
      roundSurvivor.addRoundSurvivalBonus();
    }

    // Check if the game should end.
    if (this.gameState.shouldGameEnd()) {
      this.onGameEnd();
    } else {
      this.sendOverlayMessage({ type: 'round_over', message: 'Round Over!', player: roundSurvivor?.toPlayerData() });
      setTimeout(() => {
        this.gameState.beginWaiting();

        // Sometimes players can die on the same tick.
        let message = `Round ${this.gameState.getRoundNumber()} over!`;
        if (roundSurvivor) {
          message += ` {playerName} survived round ${this.gameState.getRoundNumber()}!`;
          this.sendPlayerMessage(message, roundSurvivor.getPlayerId());
        } else {
          this.sendDefaultMessage(message);
        }
      }, 2000);
    }

    this.sendLeaderboardUpdate();

    // Handle round cleanup
    this.inputBuffer.clearAll();
    this.gameState.cleanupPlayerObjects();
  }

  override onGameEnd() {
    let message = '';
    let overlayMessage: OverlayMessage = { type: 'game_over' };

    const highestScorers = this.gameState.calculateGameWinner();
    if (highestScorers.length === 1) {
      message = `{playerName} wins the game!`;
      overlayMessage.player = highestScorers[0]?.toPlayerData();
      highestScorers[0]?.addGameWin();

      this.sendPlayerMessage(message, highestScorers[0]?.getPlayerId() ?? '');
    } else {
      message = 'Tie Game!';
      overlayMessage.message = message;
      this.sendDefaultMessage(message);
    }

    // Let the players see the game over message for a few seconds...
    setTimeout(() => {
      this.gameState.resetGame();
    }, 2000);

    this.sendOverlayMessage(overlayMessage);
  }

  /****************************************/
  /***********MESSAGE SENDING STUFF********/
  /****************************************/

  public getPlayerDataById(playerId: string) {
    return this.gameState.getPlayer(playerId)?.toPlayerData();
  }

  private sendDefaultMessage(message: string, type: GameMessage['type'] = 'default') {
    this.gameEventBus.emit(GameEvents.MESSAGE_EVENT, this.roomId, [{ type, message }]);
  }

  private sendPlayerMessage(message: string, playerId: string) {
    this.gameEventBus.emit(GameEvents.MESSAGE_EVENT, this.roomId, [
      { type: 'player', message: message, playerData: this.getPlayerDataById(playerId) },
    ]);
  }

  private sendLeaderboardUpdate() {
    this.gameEventBus.emit(
      GameEvents.LEADERBOARD_UPDATE,
      this.roomId,
      this.gameState.getPlayerData().sort((a, b) => b.score - a.score)
    );
  }

  private sendOverlayMessage(overlayMessage: OverlayMessage) {
    this.gameEventBus.emit(GameEvents.OVERLAY_MESSAGE, this.roomId, overlayMessage);
  }
}
