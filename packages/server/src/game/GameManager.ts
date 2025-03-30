import { DEFAULT_GRID_SIZE, TICK_RATE_MS } from '../config/gameConfig';
import { GameState } from './GameState';
import { NetworkManager } from './NetworkManager';

export class GameManager {
  private tickInterval: NodeJS.Timer | null = null;

  private gameState: GameState;
  private networkManager: NetworkManager;

  constructor() {
    this.gameState = new GameState(DEFAULT_GRID_SIZE);
    this.networkManager = new NetworkManager();
    this.setupNetworkHandlers();
  }

  public start() {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => {
      this.tick();
    }, TICK_RATE_MS);
  }

  setupNetworkHandlers() {
    this.networkManager.onPlayerJoin((playerId) => {
      this.gameState.spawnPlayer(playerId);
    });

    this.networkManager.onPlayerExit((playerId) => {
      this.gameState.removePlayer(playerId);
    });
  }

  public tick() {
    this.gameState.tick();

    this.networkManager.broadcastGameState(this.gameState.getSharedGameState());
  }

  public stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval as NodeJS.Timeout);
      this.tickInterval = null;
    }
  }
}
