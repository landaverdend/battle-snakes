export class GameLoop {
  private interval: NodeJS.Timeout | null = null;
  private readonly tickRate: number;
  private lastTickTime: number = 0;

  constructor(private readonly callback: (deltaTime: number) => void, tickRate: number = 100) {
    this.tickRate = tickRate;
  }

  public start(): void {
    if (this.interval) return;
    this.interval = setInterval(() => this.tick(), this.tickRate);
  }

  public stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private tick(): void {
    const now = Date.now();
    const deltaTime = now - this.lastTickTime;
    this.lastTickTime = now;

    this.callback(deltaTime);
  }
}
