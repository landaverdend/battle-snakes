import { CellType, GameState, GridCell, StateUpdate } from '@battle-snakes/shared';
export class ClientGameState {
  private static instance: ClientGameState;
  private gameState: GameState;

  private constructor() {
    this.gameState = {
      players: {},
      gridState: {
        width: 25, // default grid size matching server
        height: 25,
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

  public updateState(newState: StateUpdate) {
    
    if (!this.gameState.gridState.cells) {
      this.initializeGridState(newState);
    }

    this.gameState.players = newState.players;
  }

  private initializeGridState(newState: StateUpdate) {
    console.log('initializing grid state....');

    const cells: GridCell[][] = [];

    for (let i = 0; i < newState.gridState.height; i++) {
      cells.push(new Array(newState.gridState.width).fill(CellType.Empty));
    }

    this.gameState.gridState = {
      width: newState.gridState.width,
      height: newState.gridState.height,
      cells: cells,
    };
  }

  public getState(): GameState {
    return this.gameState;
  }
}
