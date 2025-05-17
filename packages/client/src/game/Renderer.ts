import { CellType, Point } from '@battle-snakes/shared';
import { ClientGameState } from '../state/ClientGameState';
import { ClientPlayerObservable } from '@/state/ClientPlayerObservable';

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
    this.drawSpawnToolTip();
  }

  private drawSpawnToolTip() {
    // if we're not waiting or no player has a spawn point, don't draw the tooltip.
    if (!ClientGameState.getInstance().isRoundWaiting() || !ClientPlayerObservable.getInstance().getState().spawnPoint) return;
    // Get the player's state, which includes the spawn point
    const playerState = ClientPlayerObservable.getInstance().getState();
    const spawnPoint = playerState.spawnPoint;

    // Defensive check: if for some reason spawnPoint isn't set, exit.
    // (The condition in the `render` method should already ensure it's set).
    if (!spawnPoint) {
      return;
    }

    // Get the grid size from the game state
    const { gridSize } = this.gameState.getState();

    // Calculate the width and height of each cell in the grid
    const cellWidth = this.canvasWidth / gridSize;
    const cellHeight = this.canvasHeight / gridSize;

    // Determine the center coordinates of the spawn cell
    const centerX = spawnPoint.x * cellWidth + cellWidth / 2;
    const centerY = spawnPoint.y * cellHeight - cellHeight;

    // Dynamically set the font size based on the cell dimensions.
    // This ensures the text scales with the grid and isn't too tiny or overly large.
    // We'll use 40% of the smaller cell dimension, with a minimum of 10px.
    const fontSize = Math.max(10, Math.min(cellWidth, cellHeight) * 0.4);
    this.ctx.font = `bold ${fontSize}px `;

    this.ctx.textAlign = 'center'; // Center the text horizontally
    this.ctx.textBaseline = 'middle'; // Center the text vertically

    // Draw the "YOU" text at the calculated center of the spawn cell
    this.ctx.fillText('YOU', centerX, centerY);

    const textMetrics = this.ctx.measureText('YOU');
    const textBackgroundWidth = textMetrics.width + fontSize * 0.4;
    const textBackgroundHeight = fontSize * 1.2;

    this.ctx.fillStyle = '#060084';
    this.ctx.fillRect(
      centerX - textBackgroundWidth / 2,
      centerY - textBackgroundHeight / 2,
      textBackgroundWidth,
      textBackgroundHeight
    );

    // Re-set fillStyle for the text if you draw a background
    this.ctx.fillStyle = 'white';
    this.ctx.fillText('YOU', centerX, centerY);
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
    const padding = 0;
    this.ctx.fillRect(x * cellWidth + padding, y * cellHeight + padding, cellWidth - padding * 2, cellHeight - padding * 2);
  }

  private drawFoodCell(x: number, y: number, cellWidth: number, cellHeight: number) {
    this.ctx.fillStyle = 'red';

    // Calculate center point of the cell
    const centerX = x * cellWidth + cellWidth / 2;
    const centerY = y * cellHeight + cellHeight / 2;

    const padding = 1;
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
