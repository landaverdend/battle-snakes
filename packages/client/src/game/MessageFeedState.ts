import { Message } from '@battle-snakes/shared';
import ObservableStateManager from './ObservableStateManager';

export class MessageFeedState extends ObservableStateManager<Message[]> {
  private static instance: MessageFeedState;

  private constructor() {
    const initialState: Message[] = [];
    super(initialState);
  }

  public static getInstance(): MessageFeedState {
    if (!MessageFeedState.instance) {
      MessageFeedState.instance = new MessageFeedState();
    }
    return MessageFeedState.instance;
  }

  public override updateState(messages: Message[]) {
    this.state = messages;
    this.notifyListeners(this.state);
  }

  public addAction(action: Message[]) {
    this.updateState([...this.state, ...action]);
  }
}
