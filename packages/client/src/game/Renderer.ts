export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
  }

  public initialize(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
  }

  resize(width: number, height: number) {
    // Update internal dimensions
    this.width = width;
    this.height = height;
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Stick drawing logic here...
    this.drawGrid();
  }

  drawGrid() {
    const cellWidth = this.width / 5;
    const cellHeight = this.height / 5;

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
