import { GameAction } from '@battle-snakes/shared';

export class ActionFeedManager {
  private static instance: ActionFeedManager;
  private actionFeed: GameAction[] = [];
  private listeners: ((actions: GameAction[]) => void)[] = [];

  private constructor() {}

  public static getInstance(): ActionFeedManager {
    if (!ActionFeedManager.instance) {
      ActionFeedManager.instance = new ActionFeedManager();
    }
    return ActionFeedManager.instance;
  }

  public addListener(listener: (actions: GameAction[]) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (actions: GameAction[]) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public addAction(action: GameAction) {
    this.actionFeed = [action, ...this.actionFeed].slice(0, 10);
    this.notifyListeners();
  }

  public getActions(): GameAction[] {
    return this.actionFeed;
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.actionFeed));
  }
}
