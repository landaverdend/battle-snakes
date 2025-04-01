import { SharedGameState } from '@battle-snakes/shared';
export class ClientGameState {
  private static instance: ClientGameState;
  private gameState: SharedGameState;

  private constructor() {
    this.gameState = {
      players: [],
      grid: {},
      gridSize: 0,
    };
  }

  public static getInstance(): ClientGameState {
    if (!ClientGameState.instance) {
      ClientGameState.instance = new ClientGameState();
    }
    return ClientGameState.instance;
  }

  public updateState(newState: SharedGameState) {
    this.gameState = { ...newState };
  }

  public getState(): SharedGameState {
    return this.gameState;
  }
}
