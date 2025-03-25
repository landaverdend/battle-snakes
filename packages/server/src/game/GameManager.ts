import GameState from './GameState';
import { NetworkManager } from './NetworkManager';

export class GameManager {
  private gameState: GameState;
  private networkManager: NetworkManager;

  constructor() {
    this.gameState = new GameState(25, 25);

    this.networkManager = new NetworkManager(this.gameState);
  }

  public start() {
    console.log('Starting game manager...');
    this.gameState.startGameLoop();
    this.networkManager.initialize();
  }

  // TODO: implement stopping/
  public stop() {}
}
