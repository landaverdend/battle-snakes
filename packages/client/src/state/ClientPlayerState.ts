import ObservableStateManager from './ObservableStateManager';

type PlayerState = {
  isAlive: boolean;
};

export class ClientPlayerState extends ObservableStateManager<PlayerState> {
  private static instance: ClientPlayerState;

  private constructor() {
    const initialState: PlayerState = {
      isAlive: true,
    };
    super(initialState);
  }

  public static getInstance(): ClientPlayerState {
    if (!ClientPlayerState.instance) {
      ClientPlayerState.instance = new ClientPlayerState();
    }

    return ClientPlayerState.instance;
  }
}
