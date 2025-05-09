import { Message } from '@battle-snakes/shared';
import ObservableStateManager from './ObservableStateManager';

export class MessageFeedObservable extends ObservableStateManager<Message[]> {
  private static instance: MessageFeedObservable;

  private constructor() {
    const initialState: Message[] = [];
    super(initialState);
  }

  public static getInstance(): MessageFeedObservable {
    if (!MessageFeedObservable.instance) {
      MessageFeedObservable.instance = new MessageFeedObservable();
    }
    return MessageFeedObservable.instance;
  }

  public publishMessages(action: Message[]) {
    this.publish([...this.state, ...action]);
  }
}
