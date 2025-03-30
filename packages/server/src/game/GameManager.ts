import { TICK_RATE_MS } from '../config/gameConfig';
import { GameLogic } from './GameLogic';
import { NetworkManager } from './NetworkManager';

export class GameManager {
  private tickInterval: NodeJS.Timer | null = null;
  private gameLogic: GameLogic;
  private networkManager: NetworkManager;

  constructor() {
    // this.gameState = new GameState(DEFAULT_GRID_SIZE);
    this.gameLogic = new GameLogic();
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
      this.gameLogic.spawnPlayer(playerId);
    });

    this.networkManager.onPlayerExit((playerId) => {
      this.gameLogic.removePlayer(playerId);
    });
  }

  public tick() {

    this.gameLogic.tick();

    this.networkManager.broadcastGameState(this.gameLogic.getSharedGameState());
  }

  public stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval as NodeJS.Timeout);
      this.tickInterval = null;
    }
  }
}
