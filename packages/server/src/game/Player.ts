import { CellType, Direction, GridCell, GridState, OppositeDirection, Point } from '@battle-snakes/shared';
import { CollisionType } from './GameManager';

type PlayerConfigOptions = {
  color?: string;
  startPosition: Point;
};

export class Player {
  private id: string;
  private isAlive: boolean;

  private pendingDirection: Direction;
  private direction: Direction;

  private growthQueue: number = 0;

  segments: Point[];

  color: string;

  constructor(id: string, { color, startPosition }: PlayerConfigOptions) {
    this.id = id;

    this.isAlive = true;
    this.segments = [startPosition];
    this.direction = 'up';
    this.pendingDirection = 'up';
    this.color = color || this.getRandomColor();
  }

  public getId() {
    return this.id;
  }

  public getRandomColor() {
    return '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, '0');
  }

  // Prevent 180-degree turns (on everything except for the first segment)
  public isValidMove(proposedMove: Direction) {
    return OppositeDirection[this.pendingDirection] !== proposedMove;
  }

  public setDirection(newDirection: Direction) {
    if (this.isValidMove(newDirection)) {
      this.pendingDirection = newDirection;
    }
  }

  public move() {
    this.direction = this.pendingDirection;

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

    if (this.growthQueue > 0) {
      this.growthQueue--;
    } else {
      this.segments.pop();
    }
  }

  public grow(segments: number) {
    this.growthQueue += segments;
  }

  public isDead() {
    return !this.isAlive;
  }

  public setDead() {
    this.isAlive = false;
  }

  public checkCollision(gridState: GridState, occupiedCells: Map<string, GridCell>): CollisionType | undefined {
    const head = this.segments[0] as Point;
    const headKey = head.toString();
    const cellAtHead = occupiedCells.get(headKey);

    // Wall collision
    if (this.isOutOfBounds(gridState)) {
      return {
        type: 'death',
        cause: 'wall',
        playerId: this.id,
      };
    }

    // Snake collision
    if (cellAtHead?.type === CellType.Snake) {
      return {
        type: 'death',
        cause: 'snake',
        playerId: this.id,
        targetId: cellAtHead.playerId,
      };
    }

    // Food collision
    if (cellAtHead?.type === CellType.Food) {
      return {
        type: 'food',
        cause: 'food',
        playerId: this.id,
      };
    }

    return undefined;
  }

  isOutOfBounds({ width, height }: GridState) {
    const { x, y } = this.segments[0] as Point;

    const isXOutOfBounds = x < 0 || x >= width;
    const isYOutOfBounds = y < 0 || y >= height;

    return isXOutOfBounds || isYOutOfBounds;
  }
}
