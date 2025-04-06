// packages/server/src/game/core/GameState.ts
import { CellType, Entity, Point, SharedGameState } from '@battle-snakes/shared';
import { Player } from '../domain/Player';
import { MAX_ROOM_SIZE } from '../../config/gameConfig';

export class GameState {
  private readonly gridSize: number;
  private readonly grid: Map<string, Entity>;
  private readonly players: Map<string, Player>;
  private readonly foodPositions: Set<string>;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
    this.grid = new Map();
    this.players = new Map();
    this.foodPositions = new Set();
  }

  public getGrid() {
    return this.grid;
  }

  public getGridSize(): number {
    return this.gridSize;
  }

  public getPlayer(id: string): Player | undefined {
    return this.players.get(id);
  }

  public getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  public getActivePlayers(): Player[] {
    return Array.from(this.players.values()).filter((player) => player.isActive());
  }

  public getPlayerData() {
    return Array.from(this.players.values()).map((p) => p.toPlayerData());
  }

  public getFoodPositions(): Set<string> {
    // return Array.from(this.foodPositions).map((pos) => Point.parseString(pos));
    return this.foodPositions;
  }

  public isPositionOccupied(point: Point): boolean {
    return this.grid.has(point.toString());
  }

  public hasVacancy(): boolean {
    return this.players.size < MAX_ROOM_SIZE;
  }

  // State Mutation Methods
  public addPlayer(player: Player): void {
    this.players.set(player.getPlayerId(), player);
  }

  public removePlayer(playerId: string): void {
    this.players.delete(playerId);
  }

  public addFood(point: Point): void {
    this.foodPositions.add(point.toString());
  }

  public removeFood(point: Point): void {
    this.foodPositions.delete(point.toString());
  }

  public killPlayer(playerId: string) {
    this.players.get(playerId)?.kill();
  }

  public growPlayer(playerId: string) {
    this.players.get(playerId)?.grow();
  }

  // Grid Update Method
  public updateGrid(): void {
    this.grid.clear();

    // Add active players to grid
    for (const player of this.players.values()) {
      if (!player.isActive()) continue;

      player.getSegments().forEach((segment) => {
        this.grid.set(segment.toString(), {
          type: CellType.Snake,
          playerId: player.getPlayerId(),
          color: player.getColor(),
        });
      });
    }

    // Add food to grid
    for (const food of this.foodPositions) {
      this.grid.set(food, { type: CellType.Food });
    }
  }

  // Return an map of points => playerId's.
  public getActivePlayerCells(): Map<string, string> {
    const toRet = new Map<string, string>();

    for (const player of this.getActivePlayers()) {
      for (const segment of player.segments) {
        toRet.set(segment.toString(), player.getPlayerId());
      }
    }

    return toRet;
  }

  // Serialization for network
  public toSharedGameState(): SharedGameState {
    return {
      grid: Object.fromEntries(this.grid.entries()),
      gridSize: this.gridSize,
      players: this.getAllPlayers().map((p) => p.toPlayerData()),
    };
  }
}
