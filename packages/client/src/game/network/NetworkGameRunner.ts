import { NetworkService } from '@/service/NetworkService';
import { InputService } from '@/service/InputService';
import { ChatService } from '@/service/ChatService';
import { GameConfigOptions, GameRunner } from '../GameRunner';

export class NetworkGameRunner extends GameRunner {
  private network: NetworkService;
  private inputService: InputService;
  private chatService: ChatService;

  constructor(ctx: CanvasRenderingContext2D, gameConfig: GameConfigOptions) {
    super(ctx);

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
}
