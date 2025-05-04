type PlayerState = {
  isAlive: boolean;
};

export class ClientPlayerState {
  private static instance: ClientPlayerState;
  private playerState: PlayerState;
  private listeners: ((state: PlayerState) => void)[] = [];

  private constructor() {
    this.playerState = {
      isAlive: true,
    };
  }

  public static getInstance(): ClientPlayerState {
    if (!ClientPlayerState.instance) {
      ClientPlayerState.instance = new ClientPlayerState();
    }

    return ClientPlayerState.instance;
  }

  public addListener(listener: (state: PlayerState) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (state: PlayerState) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public updateState(newState: PlayerState) {
    this.playerState = { ...newState };
    this.notifyListeners();
  }

  public getState(): PlayerState {
    return this.playerState;
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.playerState);
      } catch (error) {
        console.error('Error in ClientGameState listener:', error);
      }
    });
  }
}
