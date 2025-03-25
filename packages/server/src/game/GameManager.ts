import GameState from './GameState';
import { NetworkManager } from './NetworkManager';

export class GameManager {
  private gameState: GameState;
  private networkManager: NetworkManager;

  private gameLoopInterval: NodeJS.Timer | null = null;
  private isRunning = false;

  constructor() {
    this.gameState = new GameState(25, 25);
    this.networkManager = new NetworkManager(this.gameState);
  }

  public start() {
    console.log('Starting game manager...');
    this.startGameLoop();
    this.networkManager.initialize();
  }

  private startGameLoop() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.gameLoopInterval = setInterval(() => {
      this.update();
    }, this.gameState.getTickRate());
  }

  private update() {
    this.gameState.updatePositions();
    const collisions = this.gameState.checkCollisions();

    if (collisions.length > 0) {
      collisions.forEach((collision) => this.networkManager.broadcastGameAction(collision));
    }

    this.networkManager.broadCastGameState();
  }

  // TODO: implement stopping/
  public stop() {}
}
