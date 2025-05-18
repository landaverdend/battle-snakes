import { DEFAULT_GRID_SIZE } from '@battle-snakes/shared';
import { GameConfigOptions, GameRunner } from '../GameRunner';
import { LocalGame } from './LocalGame';

export class LocalGameRunner extends GameRunner {
  private game: LocalGame;

  private lastFrameTime;
  constructor(ctx: CanvasRenderingContext2D, gameConfig: GameConfigOptions) {
    super(ctx);

    this.game = new LocalGame(DEFAULT_GRID_SIZE, gameConfig);
    this.lastFrameTime = performance.now();
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.game.start();

    this.gameLoop();
  }

  gameLoop() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // TODO: this can be improved in the future by just passing in the gamestate directly to the renderer. For now, this works.
    this.game.tick(deltaTime);
    this.renderer.render();

    this.animationFrameId = requestAnimationFrame(() => {
      this.gameLoop();
    });
  }

  stop(): void {
    this.game.stop();
  }
}
