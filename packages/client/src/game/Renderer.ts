import { GameState } from '@battle-snakes/shared';
import { ClientGameState } from './ClientGameState';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private gameState: ClientGameState;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.canvasWidth = ctx.canvas.width;
    this.canvasHeight = ctx.canvas.height;
    this.gameState = ClientGameState.getInstance();
  }

  public initialize(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.canvasWidth = ctx.canvas.width;
    this.canvasHeight = ctx.canvas.height;
  }

  resize(width: number, height: number) {
    // Update internal dimensions
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Stick drawing logic here...
    this.drawGrid();
  }

  drawGrid() {
    const { width, height } = this.gameState.getState().gridState;

    const cellWidth = this.canvasWidth / width;
    const cellHeight = this.canvasHeight / height;

    // Draw vertical lines
    for (let x = 0; x <= this.canvasWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * cellWidth, 0);
      this.ctx.lineTo(x * cellWidth, this.canvasHeight);
      this.ctx.strokeStyle = '#ddd';

      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= this.canvasHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * cellHeight);
      this.ctx.lineTo(this.canvasWidth, y * cellHeight);
      this.ctx.strokeStyle = '#ddd';
      this.ctx.stroke();
    }
  }
}
