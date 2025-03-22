export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;

    console.log(width, height);
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
    }
  }

  resize(width: number, height: number) {
    if (this.ctx.canvas.width !== width || this.ctx.canvas.height !== height) {
      this.ctx.canvas.width = width;
      this.ctx.canvas.height = height;
    }
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.update();
    this.draw();
  }

  update() {
    // stick logic here...
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Stick drawing logic here...
    this.drawGrid();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  drawGrid() {
    const cellWidth = this.width / 15;
    const cellHeight = this.height / 15;

    // Draw vertical lines
    for (let x = 0; x <= this.width; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * cellWidth, 0);
      this.ctx.lineTo(x * cellWidth, this.height);
      this.ctx.strokeStyle = '#ddd';

      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= this.height; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * cellHeight);
      this.ctx.lineTo(this.width, y * cellHeight);
      this.ctx.strokeStyle = '#ddd';
      this.ctx.stroke();
    }
  }
}
