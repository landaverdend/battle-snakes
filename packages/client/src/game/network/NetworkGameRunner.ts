import { ConnectionService } from '@/game/network/service/ConnectionService';
import { NetworkInputHandler } from '@/game/network/service/InputHandler';
import { ChatService } from '@/game/network/service/ChatService';
import { GameConfigOptions, GameRunner } from '../GameRunner';
import { Direction } from '@battle-snakes/shared';
import { InputHandler } from '../InputHandler';

export class NetworkGameRunner extends GameRunner {
  private connectionService: ConnectionService;
  private inputHandler: InputHandler;
  private chatService: ChatService;

  constructor(ctx: CanvasRenderingContext2D, gameConfig: GameConfigOptions) {
    super(ctx);

    this.connectionService = new ConnectionService(gameConfig);
    this.inputHandler = new NetworkInputHandler(this.connectionService.getSocket());
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

    this.connectionService.disconnect();
  }

  handleInput(dir: Direction): void {
    this.inputHandler.handleInput(dir);
  }
}
