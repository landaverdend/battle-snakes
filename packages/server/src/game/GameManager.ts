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
  }

  public start() {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => {
      this.tick();
    }, TICK_RATE_MS);
  }

  public tick() {
    this.networkManager.broadcastGameState(this.gameState.getSharedGameState());
  }

  public stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval as NodeJS.Timeout);
      this.tickInterval = null;
    }
  }
}
