import { Renderer } from './Renderer';
import { NetworkService } from '../service/NetworkService';
import { InputService } from '../service/InputService';

export interface GameConfigOptions {
  playerName: string;
  playerColor: string;
  isCpuGame?: boolean;
}
export class GameClient {
  private renderer: Renderer;
  private network: NetworkService;
  private inputService: InputService;

  private isRunning: boolean = false;
  private animationFrameId: number | null = null;

  constructor(ctx: CanvasRenderingContext2D, gameConfig: GameConfigOptions) {
    this.renderer = new Renderer(ctx);
    this.network = new NetworkService(gameConfig);
    this.inputService = new InputService(this.network.getSocket());
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
