import { Message } from '@battle-snakes/shared';

export class MessageFeedService {
  private static instance: MessageFeedService;
  private messageFeed: Message[] = [];
  private listeners: ((actions: Message[]) => void)[] = [];

  private constructor() {}

  public static getInstance(): MessageFeedService {
    if (!MessageFeedService.instance) {
      MessageFeedService.instance = new MessageFeedService();
    }
    return MessageFeedService.instance;
  }

  public addListener(listener: (actions: Message[]) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (actions: Message[]) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public addAction(action: Message[]) {
    this.messageFeed = [ ...this.messageFeed, ...action];
    this.notifyListeners();
  }

  public getActions(): Message[] {
    return this.messageFeed;
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.messageFeed));
  }
}
