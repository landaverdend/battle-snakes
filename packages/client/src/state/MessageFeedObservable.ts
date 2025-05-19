import { GameMessage } from '@battle-snakes/shared';
import ObservableStateManager from './ObservableStateManager';

export function publishMessage(message: GameMessage | GameMessage[]) {
  if (Array.isArray(message)) {
    MessageFeedObservable.getInstance().publishMessages(message);
  } else {
    MessageFeedObservable.getInstance().publish([message]);
  }
}
export class MessageFeedObservable extends ObservableStateManager<GameMessage[]> {
  private static instance: MessageFeedObservable;

  private constructor() {
    const initialState: GameMessage[] = [];
    super(initialState);
  }

  public static getInstance(): MessageFeedObservable {
    if (!MessageFeedObservable.instance) {
      MessageFeedObservable.instance = new MessageFeedObservable();
    }
    return MessageFeedObservable.instance;
  }

  public publishMessages(action: GameMessage[]) {
    this.publish([...this.state, ...action]);
  }
}
