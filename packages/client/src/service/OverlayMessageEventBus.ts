import { OverlayMessage } from '@battle-snakes/shared';

export class OverlayMessageEventBus {
  private static instance: OverlayMessageEventBus;
  private subscribers: ((data: OverlayMessage) => void)[] = [];

  private constructor() {}

  public static getInstance(): OverlayMessageEventBus {
    if (!OverlayMessageEventBus.instance) {
      OverlayMessageEventBus.instance = new OverlayMessageEventBus();
    }
    return OverlayMessageEventBus.instance;
  }

  public subscribe(subscriber: (data: OverlayMessage) => void) {
    this.subscribers.push(subscriber);
  }

  public unsubscribe(subscriber: (data: OverlayMessage) => void): void {
    this.subscribers = this.subscribers.filter((s) => s !== subscriber);
  }

  public publish(message: OverlayMessage) {
    this.subscribers.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in OverlayMessageEventBus listener:', error);
      }
    });
  }
}
