import { ConnectionService } from '@/game/network/service/ConnectionService';
import { InputService } from '@/game/network/service/InputService';
import { ChatService } from '@/game/network/service/ChatService';
import { GameConfigOptions, GameRunner } from '../GameRunner';

export class NetworkGameRunner extends GameRunner {
  private connectionService: ConnectionService;
  private inputService: InputService;
  private chatService: ChatService;

  constructor(ctx: CanvasRenderingContext2D, gameConfig: GameConfigOptions) {
    super(ctx);

    this.connectionService = new ConnectionService(gameConfig);
    this.inputService = new InputService(this.connectionService.getSocket());
    this.chatService = ChatService.getInstance(this.connectionService.getSocket());
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.renderer.render();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
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

    this.inputService.destroy();
    this.connectionService.disconnect();
  }
}
