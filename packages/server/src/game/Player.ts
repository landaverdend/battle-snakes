import { Direction, GameState, GridState, OppositeDirection, Point } from '@battle-snakes/shared';

type PlayerConfigOptions = {
  color?: string;
  startPosition: Point;
};

export class Player {
  private id: string;

  segments: Point[];
  direction: Direction;
  color: string;

  constructor(id: string, { color, startPosition }: PlayerConfigOptions) {
    this.id = id;

    this.segments = [startPosition];
    this.direction = 'up';
    this.color = color || this.getRandomColor();
  }

  public getRandomColor() {
    return '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, '0');
  }

  // Prevent 180-degree turns (on everything except for the first segment)
  public isValidMove(proposedMove: Direction) {
    return this.segments.length === 1 || OppositeDirection[this.direction] !== proposedMove;
  }

  hasCollided(gameState: GameState) {

    if (this.isWallCollision(gameState.gridState)) return true;
    

    return false;
  }

  isWallCollision(gridState: GridState) {
    const { x, y } = this.segments[0] as Point;
    const { width, height } = gridState;

    const isXOutOfBounds = x < 0 || x >= width;
    const isYOutOfBounds = y < 0 || y >= height;

    return isXOutOfBounds || isYOutOfBounds;
  }
}
