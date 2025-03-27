import { GameEvent } from '@battle-snakes/shared';

export class ActionFeedManager {
  private static instance: ActionFeedManager;
  private actionFeed: GameEvent[] = [];
  private listeners: ((actions: GameEvent[]) => void)[] = [];

  private constructor() {}

  public static getInstance(): ActionFeedManager {
    if (!ActionFeedManager.instance) {
      ActionFeedManager.instance = new ActionFeedManager();
    }
    return ActionFeedManager.instance;
  }

  public addListener(listener: (actions: GameEvent[]) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (actions: GameEvent[]) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public addAction(action: GameEvent) {
    this.actionFeed = [action, ...this.actionFeed].slice(0, 10);
    this.notifyListeners();
  }

  public getActions(): GameEvent[] {
    return this.actionFeed;
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.actionFeed));
  }
}
