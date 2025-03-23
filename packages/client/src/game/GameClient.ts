import { Renderer } from './Renderer';
import { NetworkManager } from './NetworkManager';
import { InputManager } from './InputManager';

export class GameClient {
  private renderer: Renderer;
  private network: NetworkManager;
  private inputManager: InputManager;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.renderer = new Renderer(ctx);
    this.network = new NetworkManager();
    this.inputManager = new InputManager(this.network.getSocket());
  
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
