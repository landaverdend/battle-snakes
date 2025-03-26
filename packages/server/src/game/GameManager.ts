import { DEFAULT_GRID_SIZE, TICK_RATE } from '../config/gameConfig';
import GameState from './GameState';
import { NetworkManager } from './NetworkManager';

export class GameManager {
  private gameState: GameState;
  private networkManager: NetworkManager;

  private gameLoopInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.gameState = new GameState(DEFAULT_GRID_SIZE, DEFAULT_GRID_SIZE);
    this.networkManager = new NetworkManager(this.gameState);
  }

  public start() {
    console.log('Starting game manager...');
    this.startGameLoop();
    this.networkManager.initialize();
  }

  public stop() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
  }

  private startGameLoop() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.gameLoopInterval = setInterval(() => {
      this.update();
    }, TICK_RATE);
  }

  private update() {
    this.gameState.updatePositions();
    const collisions = this.gameState.checkCollisions();

    if (collisions.length > 0) {
      collisions.forEach((collision) => this.networkManager.broadcastGameAction(collision));
    }

    this.networkManager.broadCastGameState();
  }
}
