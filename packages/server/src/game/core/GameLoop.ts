export class GameLoop {
  private interval: NodeJS.Timeout | null = null;

  private lastTickTime: number = 0;

  private static readonly TICK_RATE_MS = 15;
  public static readonly GAME_STATE_UPDATE_INTERVAL_MS = 175;

  constructor(private readonly callback: (deltaTime: number) => void) {}

  public start(): void {
    if (this.interval) return;
    this.interval = setInterval(() => this.tick(), GameLoop.TICK_RATE_MS);
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
