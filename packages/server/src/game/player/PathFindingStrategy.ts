import { CellType, DEFAULT_GRID_SIZE, Direction, Entity, getRandomNumber, Point } from '@battle-snakes/shared';
import { GameState } from '../core/GameState';
import { Player } from './Player';
import { AStarAlgorithm } from '../services/AStarAlgorithm';

export class PathFindingStrategy {
  grid: Map<string, Entity> = new Map(); // In practice this will be a reference to the game state.
  players: Player[] = [];
  gameStateRef: GameState = new GameState(DEFAULT_GRID_SIZE);

  // Cached path to the nearest food.
  private cachedPath: Point[] = [];

  private readonly DIRECTIONS = [
    { x: 0, y: -1, direction: 'up' },
    { x: 0, y: 1, direction: 'down' },
    { x: 1, y: 0, direction: 'right' },
    { x: -1, y: 0, direction: 'left' },
  ];

  constructor() {}

  public clearData() {
    this.cachedPath = [];
  }

  /**
   * Main interface for outside classes. We might want to
   * @param gameState
   * @param head
   * @returns
   */
  public getNextMove(gameState: GameState, head: Point): Direction {
    this.grid = gameState.getGrid();
    this.players = gameState.getActivePlayers();
    this.gameStateRef = gameState;

    const foodPositions = this.gameStateRef.getFoodPositionsAsPoints();
    const target = this.calculateShortestManhattanDistance(head, foodPositions);

    // Check if we need to recalculate the current path (stale data, blockage, etc..)
    if (!this.isValidPath()) {
      this.cachedPath = AStarAlgorithm.calculateAStar(this.gameStateRef, head, target);
    }

    if (this.cachedPath.length > 0) {
      const currentHeadPosition = head;
      const nextPositionInPath = this.cachedPath.shift() as Point;

      const deltaX = nextPositionInPath.x - currentHeadPosition.x;
      const deltaY = nextPositionInPath.y - currentHeadPosition.y;

      if (deltaX === 1 && deltaY === 0) {
        return 'right';
      } else if (deltaX === -1 && deltaY === 0) {
        return 'left';
      } else if (deltaX === 0 && deltaY === -1) {
        return 'up';
      } else if (deltaX === 0 && deltaY === 1) {
        return 'down';
      }
    }

    return this.getRandomValidDirection(head);
  }

  private calculateShortestManhattanDistance(origin: Point, targets: Point[]) {
    let minDistance = Infinity;
    let minDistanceTarget: Point = new Point(-1, -1);

    for (const possibleTarget of targets) {
      const distance = origin.calculateManhattanDistance(possibleTarget);
      if (distance < minDistance) {
        minDistance = distance;
        minDistanceTarget = possibleTarget;
      }
    }

    return minDistanceTarget;
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
    const lastCellEntity = this.gameStateRef.getEntityAtPosition(lastCell);

    if (lastCellEntity.type !== CellType.Food) {
      return false;
    }

    // Check all cells except the last one (which should be food)
    for (let i = 0; i < this.cachedPath.length - 1; i++) {
      const point = this.cachedPath[i] as Point;
      const entity = this.gameStateRef.getEntityAtPosition(point);

      // Only check if the cell is empty
      if (entity.type !== CellType.Empty) {
        return false;
      }
    }

    return true;
  }

  private getRandomValidDirection(head: Point): Direction {
    const validDirections = this.DIRECTIONS.filter(
      (direction) =>
        this.gameStateRef.getEntityAtPosition(new Point(head.x + direction.x, head.y + direction.y)).type === CellType.Empty
    );

    return validDirections[getRandomNumber(0, validDirections.length - 1)]?.direction as Direction;
  }
}
