import { DEFAULT_GRID_SIZE, TICK_RATE } from '../config/gameConfig';
import GameState from './GameState';
import { NetworkManager } from './NetworkManager';

export type CollisionType = {
  type: 'death' | 'food';
  cause: 'wall' | 'snake' | 'food';
  playerId: string;
  targetId?: string | undefined; // for snake collisions
};

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

    const collisions = this.gameState.trackAndHandleCollisions();
    collisions.forEach((collision) => {
      if (collision.type === 'death') {
        this.networkManager.broadcastGameEvent({
          type: 'death',
          playerId: collision.playerId,
          targetId: collision.targetId,
        });
      }
    });

    this.gameState.placeFood();
    this.gameState.updateOccupiedCells();
    this.networkManager.broadCastGameState();
  }
}
