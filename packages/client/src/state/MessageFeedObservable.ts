import { GameMessage } from '@battle-snakes/shared';
import ObservableStateManager from './ObservableStateManager';

export function publishMessage(message: GameMessage | GameMessage[]) {
  if (Array.isArray(message)) {
    MessageFeedObservable.getInstance().publishMessages(message);
  } else {
    MessageFeedObservable.getInstance().publishMessages([message]);
  }
}
export class MessageFeedObservable extends ObservableStateManager<GameMessage[]> {
  private static instance: MessageFeedObservable;

  private constructor() {
    const initialState: GameMessage[] = [
      { type: 'default', message: 'Use WASD or the arrow keys to move! Try to survive as long as possible!' },
      { type: 'default', message: '-----------------------------------------' },
    ];
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
