import {
  Collision,
  COUNTDOWN_TIME,
  DEFAULT_FOOD_COUNT,
  Direction,
  Game,
  GameEvents,
  GameLoop,
  GameState,
  RoundState,
  SpawnService,
} from '@battle-snakes/shared';
import { GameEventBus } from '../events/GameEventBus';
import { InputBuffer } from '../input/InputBuffer';
import { CollisionService } from '@battle-snakes/shared/src/services/CollisionService';
import { LobbyService } from '../services/LobbyService';
import { RoundService } from '../services/RoundService';
import { MessageDispatchService } from '../services/MessageDispatchService';
import { ActiveGameStrategy } from './ActiveGameStrategy';

export type NetworkGameConfig = {
  roomId: string;
  gridSize: number;
  gameEventBus: GameEventBus;
};
export interface NetworkGameContext {
  roomId: string;
  spawnService: SpawnService;
  inputBuffer: InputBuffer;
  gameState: GameState;
  messageDispatchService: MessageDispatchService;
}

export class NetworkGame extends Game {
  private roomId: string;
  private gameEventBus: GameEventBus;
  private inputBuffer: InputBuffer;

  private lobbyService: LobbyService;
  private roundService: RoundService;
  private messageDispatchService: MessageDispatchService;

  private activeGameStrategy: ActiveGameStrategy;

  private haveEntitiesBeenSpawned = false;

  private countdownIntervalRef: NodeJS.Timeout | null = null;
  private countdownValue: number | null = null;

  constructor({ roomId, gridSize, gameEventBus }: NetworkGameConfig) {
    super(gridSize);

    this.roomId = roomId;
    this.gameEventBus = gameEventBus;
    this.inputBuffer = new InputBuffer(gameEventBus);
    this.messageDispatchService = new MessageDispatchService(roomId, this.gameState, this.gameEventBus);

    const context: NetworkGameContext = {
      roomId,
      spawnService: this.spawnService,
      inputBuffer: this.inputBuffer,
      gameState: this.gameState,
      messageDispatchService: this.messageDispatchService,
    };

    this.lobbyService = new LobbyService(context);
    this.roundService = new RoundService(context);
    this.activeGameStrategy = new ActiveGameStrategy({ ...context }, this.roundService, this.spawnService);
  }

  override tick(deltaTime: number): void {
    switch (this.gameState.getRoundState()) {
      case RoundState.ACTIVE:
        this.activeGameStrategy.tick(deltaTime);
        break;

      case RoundState.WAITING:
        this.waitingTick();
        break;
    }
  }

  public override start(): void {
    this.gameState.beginWaiting();
    this.gameLoop.start();
  }

  public override stop(): void {
    this.gameLoop.stop();
  }

  private waitingTick(): void {
    // Spawn initial entities if they aren't there yet.
    if (!this.haveEntitiesBeenSpawned) {
      this.spawnService.spawnInitialFood();
      this.spawnService.spawnAllPlayers();
      this.haveEntitiesBeenSpawned = true;

      if (this.gameState.getAllPlayers().length === 1) {
        this.messageDispatchService.sendDefaultMessage('Waiting for players to join...');
        this.messageDispatchService.sendOverlayMessage({ type: 'waiting', message: 'Waiting for players to join...' });
      }

      // This is bad.
      this.gameState.getAllPlayers().forEach((p) =>
        this.messageDispatchService.sendClientSpecificData(p.getPlayerId(), {
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
    this.messageDispatchService.sendOverlayMessage({ type: 'countdown', message: String(this.countdownValue) });

    this.countdownIntervalRef = setInterval(() => {
      if (this.countdownValue === null) {
        return;
      }

      this.countdownValue--;
      if (this.countdownValue > 0) {
        this.messageDispatchService.sendOverlayMessage({ type: 'countdown', message: String(this.countdownValue) });
      } else {
        this.clearCountdown();
        this.haveEntitiesBeenSpawned = false;
        this.roundService.onRoundStart();
        this.messageDispatchService.sendOverlayMessage({ type: 'clear' });
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

  public handleSingularPlayerInput(playerId: string, direction: Direction) {
    if (this.gameState.isActive()) {
      this.inputBuffer.addInput(playerId, direction);
    }
  }

  public getPlayerData() {
    return this.gameState.getPlayerData();
  }

  public tryToAddPlayerToLobby(playerId: string, playerName: string, playerColor: string): boolean {
    return this.lobbyService.tryToAddPlayerToLobby(playerId, playerName, playerColor);
  }

  public removePlayerFromLobby(playerId: string) {
    // TODO: implement some clock object or something
    // Clear the countdown if there was one...
    if (this.gameState.getAllPlayers().length === 1) {
      this.clearCountdown();
      this.messageDispatchService.sendOverlayMessage({ type: 'waiting', message: 'Waiting for players to join...' });
    }

    this.lobbyService.removePlayerFromLobby(playerId);
  }

  public getPlayerDataById(playerId: string) {
    return this.gameState.getPlayerDataById(playerId);
  }
}
