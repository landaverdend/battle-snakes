export class GameLoop {
  private interval: NodeJS.Timeout | null = null;
  private readonly tickRate: number;

  constructor(private readonly onTick: () => void, tickRate: number = 100) {
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
    this.onTick();
  }

  public isRunning(): boolean {
    return this.interval !== null;
  }
}
