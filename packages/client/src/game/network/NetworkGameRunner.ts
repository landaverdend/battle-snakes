import { NetworkService } from '@/service/NetworkService';
import { Renderer } from '../Renderer';
import { InputService } from '@/service/InputService';
import { ChatService } from '@/service/ChatService';
import { GameConfigOptions, GameRunner } from '../GameRunner';

export class NetworkGameRunner extends GameRunner {
  private renderer: Renderer;
  private network: NetworkService;
  private inputService: InputService;
  private chatService: ChatService;

  private isRunning: boolean = false;
  private animationFrameId: number | null = null;

  constructor(ctx: CanvasRenderingContext2D, gameConfig: GameConfigOptions) {
    super();

    this.renderer = new Renderer(ctx);
    this.network = new NetworkService(gameConfig);
    this.inputService = new InputService(this.network.getSocket());
    this.chatService = ChatService.getInstance(this.network.getSocket());
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.gameLoop();
  }

  stop() {
    this.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.renderer.render();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  resize(width: number, height: number) {
    this.renderer.resize(width, height);
  }
}
