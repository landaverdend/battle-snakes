import ObservableStateManager from './ObservableStateManager';

type PlayerState = {
  isAlive: boolean;
};

export class ClientPlayerObservable extends ObservableStateManager<PlayerState> {
  private static instance: ClientPlayerObservable;

  private constructor() {
    const initialState: PlayerState = {
      isAlive: true,
    };
    super(initialState);
  }

  public static getInstance(): ClientPlayerObservable {
    if (!ClientPlayerObservable.instance) {
      ClientPlayerObservable.instance = new ClientPlayerObservable();
    }

    return ClientPlayerObservable.instance;
  }
}
