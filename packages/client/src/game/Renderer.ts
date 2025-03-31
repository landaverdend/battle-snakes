import { CellType, Point } from '@battle-snakes/shared';
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

    // Draw grid first (as background)
    this.drawGrid();
    this.drawCells();
  }

  private drawCells() {
    const { grid, gridSize } = this.gameState.getState();

    const cellWidth = this.canvasWidth / gridSize;
    const cellHeight = this.canvasHeight / gridSize;

    if (!grid) return;

    for (const [point, cellData] of Object.entries(grid)) {
      if (!point) continue;

      const { x, y } = Point.parseString(point);

      switch (cellData.type) {
        case CellType.Snake:
          this.drawSnakeCell(x, y, cellWidth, cellHeight, cellData.color!);
          break;
        case CellType.Food:
          this.drawFoodCell(x, y, cellWidth, cellHeight);
          break;
      }
    }
  }

  private drawSnakeCell(x: number, y: number, cellWidth: number, cellHeight: number, color: string) {
    this.ctx.fillStyle = color;
    const padding = 2;
    this.ctx.fillRect(x * cellWidth + padding, y * cellHeight + padding, cellWidth - padding * 2, cellHeight - padding * 2);
  }

  private drawFoodCell(x: number, y: number, cellWidth: number, cellHeight: number) {
    this.ctx.fillStyle = 'red';

    // Calculate center point of the cell
    const centerX = x * cellWidth + cellWidth / 2;
    const centerY = y * cellHeight + cellHeight / 2;

    const padding = 2;
    const radius = (cellWidth - padding * 2) / 2;

    // Draw circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawGrid() {
    const { gridSize } = this.gameState.getState();
    const cellWidth = this.canvasWidth / gridSize;
    const cellHeight = this.canvasHeight / gridSize;

    this.ctx.strokeStyle = '#ddd';

    // Draw vertical lines
    for (let x = 0; x <= gridSize; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * cellWidth, 0);
      this.ctx.lineTo(x * cellWidth, this.canvasHeight);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= gridSize; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * cellHeight);
      this.ctx.lineTo(this.canvasWidth, y * cellHeight);
      this.ctx.stroke();
    }
  }
}
