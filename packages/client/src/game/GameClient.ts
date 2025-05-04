import { Renderer } from './Renderer';
import { NetworkManager } from './NetworkManager';
import { InputService } from './InputService';

export interface GameConfigOptions {
  playerName: string;
  playerColor: string;
  isCpuGame?: boolean;
}
export class GameClient {
  private renderer: Renderer;
  private network: NetworkManager;
  private inputManager: InputService;

  private isRunning: boolean = false;
  private animationFrameId: number | null = null;

  constructor(ctx: CanvasRenderingContext2D, gameConfig: GameConfigOptions) {
    this.renderer = new Renderer(ctx);
    this.network = new NetworkManager(gameConfig);
    this.inputManager = new InputService(this.network.getSocket());
  }

  public start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.gameLoop();
  }

  public stop() {
    this.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop() {
    if (!this.isRunning) return;

    this.renderer.render();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  public resize(width: number, height: number) {
    this.renderer.resize(width, height);
  }
}
