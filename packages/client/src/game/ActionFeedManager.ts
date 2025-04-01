import { Collision } from '@battle-snakes/shared';

export class ActionFeedManager {
  private static instance: ActionFeedManager;
  private actionFeed: Collision[] = [];
  private listeners: ((actions: Collision[]) => void)[] = [];

  private constructor() {}

  public static getInstance(): ActionFeedManager {
    if (!ActionFeedManager.instance) {
      ActionFeedManager.instance = new ActionFeedManager();
    }
    return ActionFeedManager.instance;
  }

  public addListener(listener: (actions: Collision[]) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (actions: Collision[]) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public addAction(action: Collision[]) {
    this.actionFeed = [ ...this.actionFeed, ...action];
    this.notifyListeners();
  }

  public getActions(): Collision[] {
    return this.actionFeed;
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.actionFeed));
  }
}
