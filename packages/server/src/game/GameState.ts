import { CellType, Entity, SharedGameState } from '@battle-snakes/shared';
import { Player } from './Player';

export class GameState {
  gridSize: number; // size of the grid = size x size
  grid: Map<string, Entity>;

  private players: Map<string, Player>;
  private cpuPlayers: Map<string, Player>; // TODO: add cpu players.

  constructor(gridSize: number) {
    this.grid = new Map();
    this.gridSize = gridSize;
    this.players = new Map();
    this.cpuPlayers = new Map();
  }

  public getSharedGameState(): SharedGameState {
    return {
      grid: Object.fromEntries(this.grid.entries()),
      gridSize: this.gridSize,
      players: Array.from(this.players.values()).map((p) => p.toPlayerData()),
    };
  }

  public addPlayer(player: Player) {
    this.players.set(player.getPlayerId(), player);
  }

  public removePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  public killPlayer(playerId: string) {
    this.players.get(playerId)?.kill();
  }

  public getPlayers() {
    return this.players;
  }

  public getGrid() {
    return this.grid;
  }

  public update() {
    // Clear the grid for the new frame
    this.grid.clear();

    // Add all player segments to the grid
    for (const player of this.players.values()) {
      if (!player.isAlive) continue; // don't draw dead players.

      player.segments.forEach((segment) => {
        this.grid.set(segment.toString(), {
          type: CellType.Snake,
          playerId: player.getPlayerId(),
          color: player.color,
        });
      });
    }
  }
}
