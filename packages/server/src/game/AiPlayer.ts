import { Direction, getRandomNumber, GridState, Point } from '@battle-snakes/shared';
import { Player, PlayerConfigOptions } from './Player';

export class AiPlayer extends Player {
  private gridState?: GridState;
  private foodPositions?: Set<string>;

  constructor(id: string, options: PlayerConfigOptions) {
    super(id, options);
  }

  public updateGameState(gridState: GridState, foodPositions: Set<string>) {
    this.gridState = gridState;
    this.foodPositions = foodPositions;
  }

  // Choose the next move before actually moving
  public chooseNextMove() {
    if (!this.gridState || !this.foodPositions) return;

    const head = this.getHead();
    const possibleMoves = this.getPossibleMoves();

    // If there's food, try to move towards it
    const nearestFood = this.findNearestFood();
    if (nearestFood) {
      // Calculate which direction gets us closer to food
      const bestMove = this.getBestMoveTowardsTarget(head, nearestFood, possibleMoves);
      if (bestMove) {
        this.setDirection(bestMove);
        return;
      }
    }

    // If we can't move towards food, just pick a random valid move
    const randomMove = possibleMoves[getRandomNumber(0, possibleMoves.length)] as Direction;
    this.setDirection(randomMove);
  }

  private getPossibleMoves(): Direction[] {
    if (!this.gridState) return [];

    const head = this.getHead();
    const possibleMoves: Direction[] = [];
    const directions: Direction[] = ['up', 'down', 'left', 'right'];

    for (const dir of directions) {
      if (!this.isValidMove(dir)) continue;

      const newPos = this.getNewPosition(head, dir);
      if (!this.wouldHitWall(newPos)) {
        possibleMoves.push(dir);
      }
    }

    return possibleMoves;
  }

  private getNewPosition(point: Point, direction: Direction): Point {
    const newPoint = new Point(point.x, point.y);
    switch (direction) {
      case 'up':
        newPoint.y--;
        break;
      case 'down':
        newPoint.y++;
        break;
      case 'left':
        newPoint.x--;
        break;
      case 'right':
        newPoint.x++;
        break;
    }
    return newPoint;
  }

  private wouldHitWall(position: Point): boolean {
    if (!this.gridState) return true;
    return position.x < 0 || position.x >= this.gridState.width || position.y < 0 || position.y >= this.gridState.height;
  }

  private findNearestFood(): Point | null {
    if (!this.foodPositions) return null;

    const head = this.getHead();
    let nearestFood: Point | null = null;
    let minDistance = Infinity;

    for (const foodStr of this.foodPositions) {
      const food = Point.parseString(foodStr);
      const distance = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);

      if (distance < minDistance) {
        minDistance = distance;
        nearestFood = food;
      }
    }

    return nearestFood;
  }

  private getBestMoveTowardsTarget(from: Point, to: Point, possibleMoves: Direction[]): Direction | null {
    let bestMove: Direction | null = null;
    let minDistance = Infinity;

    for (const move of possibleMoves) {
      const newPos = this.getNewPosition(from, move);
      const distance = Math.abs(newPos.x - to.x) + Math.abs(newPos.y - to.y);

      if (distance < minDistance) {
        minDistance = distance;
        bestMove = move;
      }
    }

    return bestMove;
  }
}
