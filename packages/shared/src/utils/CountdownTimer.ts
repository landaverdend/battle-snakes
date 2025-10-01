export class CountdownTimer {
  private intervalRef: NodeJS.Timeout | null = null;
  private currentValue: number | null = null;

  private onTick: (val: number) => void;
  private onComplete: () => void;

  constructor(private readonly duration: number, onTick: (val: number) => void, onComplete: () => void) {
    this.onTick = onTick;
    this.onComplete = onComplete;
  }

  start() {
    this.currentValue = this.duration;

    this.intervalRef = setInterval(() => {
      if (this.currentValue === null) return;

      this.currentValue--;
      if (this.currentValue > 0) {
        this.onTick(this.currentValue);
      } else {
        this.clear();
        this.onComplete();
      }
    }, 1000);
  }

  clear() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
      this.currentValue = null;
    }
  }

  isRunning() {
    return this.intervalRef !== null;
  }
}
