import { CellType, DEFAULT_GRID_SIZE, Direction, Entity, getRandomNumber, Point } from '@battle-snakes/shared';
import { GameState } from '../core/GameState';
import { Player } from './Player';
import { MinPriorityQueue } from '@datastructures-js/priority-queue';

type Node = {
  position: Point;
  parent: Node | null; // for path reconstruction.
  f: number; // g + h
};

// Do a BFS to find the shortest path to the nearest food.
export class PathFinder {
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

    // Check if we need to recalculate path
    if (!this.isValidPath()) {
      this.cachedPath = this.calculateAStar(head, target);
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
   * A* algo to find shortest path between two points using manhattan distance as the heuristic.
   */
  private calculateAStar(origin: Point, target: Point): Point[] {
    // Nodes that remain to be evaluated, ordered by f value.
    const open = new MinPriorityQueue<Node>((node: Node) => node.f);
    const gScores = new Map<string, number>(); // use a map to track nodes based on their key. (point.toString())

    const initialHeuristic = origin.calculateManhattanDistance(target);
    open.enqueue({
      position: origin,
      parent: null,
      f: 0 + initialHeuristic, // f = g + h
    });
    gScores.set(origin.toString(), 0);

    // Nodes that we've already evaluated...
    const closed = new Set<string>();

    while (!open.isEmpty()) {
      const current = open.dequeue() as Node;

      // check if we've reached the target.
      if (current?.position.equals(target)) {
        return this.reconstructPath(current);
      }
      // mark current node as visited.
      closed.add(current?.position?.toString());

      // get all the neighbors of the current node.
      for (const neighbor of this.getValidNeighbors(current)) {
        const neighborKey = neighbor.toString();
        // skip already evaluated nodes.
        if (closed.has(neighborKey)) continue;

        // calculate the tentative g score...
        const currentGScore = gScores.get(current.position.toString()) ?? 0;
        const tentativeGScore = currentGScore + 1; // only add 1 since we're moving 1 cell at a time.

        // Do a check to see if there is a better path to the neighbor (lower g score), default to infinity if the neighbor is not in the gScores map
        if (tentativeGScore < (gScores.get(neighborKey) ?? Infinity)) {
          const heuristicScore = neighbor.calculateManhattanDistance(target);
          const node = {
            position: neighbor,
            parent: current,
            f: tentativeGScore + heuristicScore,
          };
          gScores.set(neighborKey, tentativeGScore);
          open.enqueue(node);
        }
      }
    }

    // It's possible that we didn't find a path.
    return [];
  }

  private reconstructPath(current: Node): Point[] {
    const path: Point[] = [];

    let currentNode: Node | null = current;
    while (currentNode !== null) {
      path.push(currentNode.position);
      currentNode = currentNode.parent;
    }

    // remove the first element from the path since it's the origin...
    return path.reverse().slice(1);
  }

  private getValidNeighbors(node: Node): Point[] {
    return node.position.getAdjacentPoints().filter((point) => this.gameStateRef.isValidPosition(point));
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
