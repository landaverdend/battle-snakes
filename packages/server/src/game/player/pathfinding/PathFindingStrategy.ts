import { CellType, DEFAULT_GRID_SIZE, Direction, Entity, getRandomNumber, Point } from '@battle-snakes/shared';
import { GameState } from '../../core/GameState';
import { Player } from '../Player';
import { AStarAlgorithm } from './AStarAlgorithm';

export class PathFindingStrategy {
  grid: Map<string, Entity> = new Map(); // In practice this will be a reference to the game state.
  players: Player[] = [];
  gameStateRef: GameState = new GameState(DEFAULT_GRID_SIZE);

  // Cached path to the nearest food.
  private cachedPath: Point[] = [];

  private readonly DIRECTIONS = [
    { x: 0, y: -1, direction: 'up' as Direction },
    { x: 0, y: 1, direction: 'down' as Direction },
    { x: 1, y: 0, direction: 'right' as Direction },
    { x: -1, y: 0, direction: 'left' as Direction },
  ];

  constructor(private readonly cpuId: string) {
    this.cpuId = cpuId;
  }

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

    let proposedDirection: Direction | null = null;

    // Grab off the cached path.
    if (this.cachedPath.length > 0) {
      const currentHeadPosition = head;
      const nextPositionInPath = this.cachedPath.shift() as Point;

      const deltaX = nextPositionInPath.x - currentHeadPosition.x;
      const deltaY = nextPositionInPath.y - currentHeadPosition.y;

      if (deltaX === 1 && deltaY === 0) {
        proposedDirection = 'right';
      } else if (deltaX === -1 && deltaY === 0) {
        proposedDirection = 'left';
      } else if (deltaX === 0 && deltaY === -1) {
        proposedDirection = 'up';
      } else if (deltaX === 0 && deltaY === 1) {
        proposedDirection = 'down';
      }
    }
    // Pick a random spot to move to.
    else {
      proposedDirection = this.getRandomValidDirection(head);
    }

    const proposedNextPosition = head.getPointInDirection(proposedDirection as Direction);

    // Look at all the players and see if the next move is safe, if not, reset the path and pick a new random direction.
    if (!this.isPositionSafeOnNextTick(proposedNextPosition)) {
      this.cachedPath = [];
      proposedDirection = this.getRandomValidDirection(head, [proposedDirection as Direction]);
    }

    return proposedDirection as Direction;
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

  // Check all the currently active players and their current directions.
  private isPositionSafeOnNextTick(point: Point): boolean {
    const players = this.gameStateRef.getActivePlayers();

    for (const player of players) {
      if (player.getPlayerId() === this.cpuId) continue;

      const nextPosition = player.getNextPosition();
      if (nextPosition.equals(point)) {
        return false;
      }
    }

    return true;
  }

  private getRandomValidDirection(head: Point, badDirections: Direction[] = []): Direction {
    const validDirections = this.DIRECTIONS.filter(
      (direction) =>
        // Entity is empty.
        this.gameStateRef.getEntityAtPosition(new Point(head.x + direction.x, head.y + direction.y)).type === CellType.Empty &&
        // Pass in already checked directions...
        !badDirections.includes(direction.direction) &&
        // Check random direction
        this.isPositionSafeOnNextTick(head.getPointInDirection(direction.direction))
    );

    // This guy is stuck, he's dead no matter what.
    if (validDirections.length === 0) {
      return 'up';
    }

    return validDirections[getRandomNumber(0, validDirections.length - 1)]?.direction as Direction;
  }
}
