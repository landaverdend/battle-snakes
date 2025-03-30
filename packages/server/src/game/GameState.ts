import { CellType, SharedGameState } from '@battle-snakes/shared';
import { SpatialGrid } from './SpatialGrid';
import { Player } from './Player';

export class GameState {
  private spatialGrid: SpatialGrid;
  private players: Map<string, Player>;

  constructor(gridSize: number) {
    this.spatialGrid = new SpatialGrid(gridSize);
    this.players = new Map();
  }

  public getSharedGameState(): SharedGameState {
    return {
      board: this.spatialGrid.toSharedGridState(),
      players: Array.from(this.players.values()).map((p) => p.toPlayerData()),
    };
  }

  public addPlayer(player: Player) {
    this.players.set(player.getPlayerId(), player);
  }

  public removePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  public getGrid() {
    return this.spatialGrid;
  }

  public getPlayers() {
    return this.players;
  }

  public update() {
    // Clear the grid for the new frame
    this.spatialGrid.clear();

    // Add all player segments to the grid
    for (const player of this.players.values()) {
      player.segments.forEach((segment) => {
        this.spatialGrid.addEntity(segment, {
          type: CellType.Snake,
          playerId: player.getPlayerId(),
          color: player.color,
        });
      });
    }
  }
}
