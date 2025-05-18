import { SpawnService } from '../services/SpawnService';
import { GameLoop } from './GameLoop';
import { GameState } from './GameState';

export abstract class Game {
  protected gameState: GameState;
  protected gameLoop: GameLoop;
  protected spawnService: SpawnService;

  constructor(gridSize: number) {
    this.gameState = new GameState(gridSize);
    this.gameLoop = new GameLoop((deltaTime: number) => this.tick(deltaTime));
    this.spawnService = new SpawnService(this.gameState);
  }


  public abstract start(): void;
  public abstract tick(deltaTime: number): void;
  public abstract stop(): void;

  public abstract onRoundStart(): void;
  public abstract onRoundEnd(): void;

  public abstract onGameEnd(): void;
}
