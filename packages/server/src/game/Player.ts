import { Direction, GridState, OppositeDirection, Point } from '@battle-snakes/shared';

type PlayerConfigOptions = {
  color?: string;
  startPosition: Point;
};

export class Player {
  private id: string;
  private isAlive: boolean;
  private shouldGrow: boolean = false;

  segments: Point[];
  direction: Direction;
  color: string;

  constructor(id: string, { color, startPosition }: PlayerConfigOptions) {
    this.id = id;

    this.isAlive = true;
    this.segments = [startPosition];
    this.direction = 'up';
    this.color = color || this.getRandomColor();
  }

  public getRandomColor() {
    return '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, '0');
  }

  // Prevent 180-degree turns (on everything except for the first segment)
  public isValidMove(proposedMove: Direction) {
    return OppositeDirection[this.direction] !== proposedMove;
  }

  public move() {
    const head = this.segments[0] as Point;
    const newHead = new Point(head.x, head.y);

    switch (this.direction) {
      case 'up':
        newHead.y--;
        break;
      case 'down':
        newHead.y++;
        break;
      case 'left':
        newHead.x--;
        break;
      case 'right':
        newHead.x++;
        break;
    }

    this.segments.unshift(newHead);

    if (!this.shouldGrow) {
      this.segments.pop();
    } else {
      this.shouldGrow = false;
    }
  }

  // TODO: it.
  public grow() {
    this.shouldGrow = true;
  }

  public isDead() {
    return !this.isAlive;
  }

  public setIsAlive(isAlive: boolean) {
    this.isAlive = isAlive;
  }

  /**
   * Check if the player has collided with a wall or another player.
   */
  checkDeathCollision(gridState: GridState, players: Map<string, Player>) {
    if (this.isWallCollision(gridState)) return true;

    return false;
  }

  isWallCollision(gridState: GridState) {
    const { x, y } = this.segments[0] as Point;
    const { width, height } = gridState;

    const isXOutOfBounds = x < 0 || x >= width;
    const isYOutOfBounds = y < 0 || y >= height;

    return isXOutOfBounds || isYOutOfBounds;
  }

  checkFoodCollision(foodPositions: Point[]): boolean {
    const head = this.segments[0] as Point;

    return foodPositions.some((foodPos) => foodPos.equals(head));
  }
}
