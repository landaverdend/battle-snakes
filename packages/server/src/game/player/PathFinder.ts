import { CellType, DEFAULT_GRID_SIZE, Direction, Entity, getRandomNumber, Point } from '@battle-snakes/shared';
import { CollisionService } from '../services/CollisionService';
import { GameState } from '../core/GameState';
import { Player } from './Player';

// Do a BFS to find the shortest path to the nearest food.
export class PathFinder {
  grid: Map<string, Entity> = new Map();
  players: Player[] = [];

  // Cached path to the nearest food.
  private cachedPath: Point[] = [];

  private readonly DIRECTIONS = [
    { x: 0, y: -1, direction: 'up' },
    { x: 0, y: 1, direction: 'down' },
    { x: 1, y: 0, direction: 'right' },
    { x: -1, y: 0, direction: 'left' },
  ];

  constructor() {}

  public getNextMove(gameState: GameState, head: Point): Direction {
    this.grid = gameState.getGrid();
    this.players = gameState.getActivePlayers();

    if (!this.isValidPath()) {
      this.calculateNewPath(head);
    }
    const nextPoint = this.cachedPath.shift();

    if (nextPoint) {
      for (const direction of this.DIRECTIONS) {
        if (nextPoint.x === head.x + direction.x && nextPoint.y === head.y + direction.y) {
          return direction.direction as Direction;
        }
      }
    }

    return this.getRandomValidDirection(head);
  }

  /**
   * A valid path is a few things:
   * 1. The path ends in a food cell.
   * 2. The path is not out of bounds, nor does it include a snake cell.
   * If either of these invariants are broken, a new path must be calculated.
   */
  private isValidPath() {
    if (this.cachedPath.length === 0) return false;

    const lastCell = this.cachedPath[this.cachedPath.length - 1] as Point;
    const lastCellEntity = this.getEntityAtPosition(lastCell);

    if (lastCellEntity.type !== CellType.Food) {
      return false;
    }

    // Check all cells except the last one (which should be food)
    for (let i = 0; i < this.cachedPath.length - 1; i++) {
      const point = this.cachedPath[i] as Point;
      const entity = this.getEntityAtPosition(point);

      // Only check if the cell is empty
      if (entity.type !== CellType.Empty) {
        return false;
      }
    }

    return true;
  }

  // Todo: maybe move this to the game state or collision service?
  private getEntityAtPosition(position: Point): Entity {
    // If we're out of bounds, return a wall.
    if (CollisionService.isOutOfBounds(position, DEFAULT_GRID_SIZE)) {
      return { type: CellType.Wall };
    }

    // If the position is not in the grid, it is considered empty.
    const value = this.grid.get(position.toString());
    if (!value) {
      return { type: CellType.Empty };
    }

    return value;
  }

  // Do a BFS to find the shortest path to the nearest food.
  private calculateNewPath(head: Point) {
    const queue: Point[] = [head];
    const visited: Set<string> = new Set();

    // Store the parent of each visited cell.
    const parentMap: Map<string, Point> = new Map();

    while (queue.length > 0) {
      const current = queue.shift() as Point;
      const currentKey = current.toString();

      if (visited.has(currentKey)) continue;

      const currentEntity = this.getEntityAtPosition(current);
      // Goal point reached.
      if (currentEntity.type === CellType.Food) {
        this.cachedPath = this.reconstructPath(current, head, parentMap);
        return;
      }

      for (const direction of this.DIRECTIONS) {
        const newPosition = new Point(current.x + direction.x, current.y + direction.y);
        const newPositionKey = newPosition.toString();

        if (visited.has(newPositionKey) || !this.isValidPosition(newPosition)) {
          continue;
        }

        parentMap.set(newPositionKey, current);
        queue.push(newPosition);
      }

      visited.add(currentKey);
    }
  }

  private reconstructPath(end: Point, start: Point, parentMap: Map<string, Point>): Point[] {
    const path: Point[] = [];
    let current = end;

    // backtrack
    while (current.toString() !== start.toString()) {
      path.unshift(current); // Add to beginning of array
      const parent = parentMap.get(current.toString());
      if (!parent) break; // Safety check
      current = parent;
    }

    return path;
  }

  private isValidPosition(position: Point): boolean {
    if (CollisionService.isOutOfBounds(position, DEFAULT_GRID_SIZE)) {
      return false;
    }

    const entity = this.getEntityAtPosition(position);
    // Allow both empty cells and food cells
    return entity.type === CellType.Empty || entity.type === CellType.Food;
  }

  private getRandomValidDirection(head: Point): Direction {
    const validDirections = this.DIRECTIONS.filter((direction) =>
      this.isValidPosition(new Point(head.x + direction.x, head.y + direction.y))
    );

    return validDirections[getRandomNumber(0, validDirections.length - 1)]?.direction as Direction;
  }
}
