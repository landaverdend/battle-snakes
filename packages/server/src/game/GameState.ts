import { getRandomColor, SharedGameState } from '@battle-snakes/shared';
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

  public spawnPlayer(playerId: string) {
    const player = new Player(playerId, {
      color: getRandomColor(),
      startPosition: this.spatialGrid.getRandomAvailablePosition(),
    });

    this.players.set(playerId, player);
    this.spatialGrid.addPlayer(player);
  }

  public removePlayer(playerId: string) {
    this.players.delete(playerId);
    console.log('player removed', playerId);
  }

  public tick() {
    // Clear the grid at each tick, then:
    // calculate new positions
    // redraw all entities in their new positions.
    this.spatialGrid.clear();

    for (const player of this.players.values()) {
    }

    // 3. Redraw all entities in their new positions
    this.updateGrid();
  }

  updateGrid() {
    for (const player of this.players.values()) {
      this.spatialGrid.addPlayer(player);
    }

    // TODO: add other entities to the grid.
  }
}
