import { Direction, getRandomNumber, OppositeDirection, Point } from '@battle-snakes/shared';

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
}
