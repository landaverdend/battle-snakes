import { GameState } from '@battle-snakes/shared';

export class ClientGameState {
  private static instance: ClientGameState;
  private gameState: GameState;

  private constructor() {
    this.gameState = {
      players: {},
      gridState: {
        width: 15, // default grid size matching server
        height: 15,
        cells: [],
      },
      gameStatus: 'waiting',
    };
  }

  public static getInstance(): ClientGameState {
    if (!ClientGameState.instance) {
      ClientGameState.instance = new ClientGameState();
    }
    return ClientGameState.instance;
  }

  public updateState(newState: GameState) {
    this.gameState = newState;
  }

  public getState(): GameState {
    return this.gameState;
  }
}
