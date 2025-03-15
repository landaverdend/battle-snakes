import { GridState, Player } from '@battle-snakes/shared';

export default class GameState {
  private gridState: GridState;
  private players: Map<String, Player>;

  constructor(width: number, height: number) {
    this.gridState = {
      width: width,
      height: height,
      cells: [[]],
    };
    this.players = new Map();
  }

  public getGridState(): GridState {
    return this.gridState;
  }

  public getPlayers(): Map<String, Player> {
    console.log(this.players);
    return this.players;
  }

  public addPlayer(socketId: string) {
    this.players.set(socketId, { id: socketId, segments: [], direction: 'up', color: '#000000' });
  }

  public removePlayer(socketId: string) {
    this.players.delete(socketId);
  }
}
