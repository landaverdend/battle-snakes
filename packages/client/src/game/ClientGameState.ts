import { RoundState, SharedGameState } from '@battle-snakes/shared';
export class ClientGameState {
  private static instance: ClientGameState;
  private gameState: SharedGameState;
  private listeners: ((state: SharedGameState) => void)[] = [];

  private constructor() {
    this.gameState = {
      players: [],
      grid: {},
      gridSize: 0,
      roundInfo: {
        roundState: RoundState.WAITING,
        roundIntermissionEndTime: null,
        roundNumber: 0,
      },
      timestamp: 0,
    };
  }

  public static getInstance(): ClientGameState {
    if (!ClientGameState.instance) {
      ClientGameState.instance = new ClientGameState();
    }
    return ClientGameState.instance;
  }

  public addListener(listener: (state: SharedGameState) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (state: SharedGameState) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public updateState(newState: SharedGameState) {
    this.gameState = { ...newState };
    this.notifyListeners();
  }

  public getState(): SharedGameState {
    return this.gameState;
  }

  public isRoundActive(): boolean {
    return this.gameState.roundInfo.roundState === RoundState.ACTIVE;
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.gameState);
      } catch (error) {
        console.error('Error in ClientGameState listener:', error);
      }
    });
  }
}
