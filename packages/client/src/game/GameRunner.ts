import { Renderer } from './Renderer';

export interface GameConfigOptions {
  playerName: string;
  playerColor: string;
  isLocalGame: boolean;
}

export abstract class GameRunner {
  private renderer: Renderer;

  protected isRunning: boolean = false;
  protected animationFrameId: number | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.renderer = new Renderer(ctx);
  }

  abstract start(): void;
  abstract stop(): void;

  resize(width: number, height: number) {
    this.renderer.resize(width, height);
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.renderer.render();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
}
