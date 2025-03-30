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
  }
}
