import { CellType, GridState, Player } from '@battle-snakes/shared';

export default class GameState {
  private gridState: GridState;
  private players: Map<String, Player>;

  constructor(width: number, height: number) {
    let cells = [];

    for (let i = 0; i < width; i++) {
      cells.push(new Array(height).fill({ type: CellType.Empty }));
    }

    this.gridState = {
      width: width,
      height: height,
      cells: cells,
    };
    this.players = new Map();
  }

  public getGridState(): GridState {
    return this.gridState;
  }

  public getPlayers(): Map<String, Player> {
    return this.players;
  }

  public addPlayer(socketId: string) {
    this.players.set(socketId, { id: socketId, segments: [], direction: 'up', color: '#000000' });
  }

  public removePlayer(socketId: string) {
    this.players.delete(socketId);
  }

  public serialize() {
    return {
      gridState: this.gridState,
      players: Object.fromEntries(this.players),
    };
  }
}
