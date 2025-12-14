import { Direction, Game, GameState, RoundState, SpawnService } from '@battle-snakes/shared';
import { GameEventBus } from '../events/GameEventBus';
import { InputBuffer } from '../input/InputBuffer';
import { LobbyService } from '../services/LobbyService';
import { RoundService } from '../services/RoundService';
import { MessageDispatchService } from '../services/MessageDispatchService';
import { ActiveGameStrategy } from './ActiveGameStrategy';
import { WaitingGameStrategy } from './WaitingGameStrategy';

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
  private gameEventBus: GameEventBus;
  private inputBuffer: InputBuffer;

  private lobbyService: LobbyService;
  private roundService: RoundService;
  private messageDispatchService: MessageDispatchService;

  private activeGameStrategy: ActiveGameStrategy;
  private waitingGameStrategy: WaitingGameStrategy;

  constructor({ roomId, gridSize, gameEventBus }: NetworkGameConfig) {
    super(gridSize);

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

    this.activeGameStrategy = new ActiveGameStrategy(context, this.roundService, this.spawnService);
    this.waitingGameStrategy = new WaitingGameStrategy(context, this.roundService, this.spawnService);
  }

  override tick(deltaTime: number): void {
    switch (this.gameState.getRoundState()) {
      case RoundState.ACTIVE:
        this.activeGameStrategy.tick(deltaTime);
        break;

      case RoundState.WAITING:
        this.waitingGameStrategy.tick();
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

  public override handleInput(dir: Direction): void {
    // NetworkGame handles inputs per player via handleSingularPlayerInput
    // This method is required by the abstract Game class but not used in network mode
    // Individual player inputs are handled through the input buffer
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
    this.waitingGameStrategy.handlePlayerRemoval();
    this.lobbyService.removePlayerFromLobby(playerId);
  }

  public getPlayerDataById(playerId: string) {
    return this.gameState.getPlayerDataById(playerId);
  }
}
