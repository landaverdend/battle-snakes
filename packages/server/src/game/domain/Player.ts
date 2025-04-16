import { Direction, getRandomColor, OppositeDirection, PlayerData, Point } from '@battle-snakes/shared';
import { DEFAULT_GROWTH_RATE } from '../../config/gameConfig';

export type PlayerConfigOptions = {
  color?: string;
  startPosition: Point;
};
export class Player {
  private id: string;
  direction: Direction;
  pendingDirection: Direction;
  color: string;
  growthQueue: number;

  segments: Point[];
  segmentSet: Set<string>;

  score: number;
  isAlive: boolean;

  constructor(id: string, config: PlayerConfigOptions) {
    this.id = id;
    this.color = config.color || getRandomColor();
    this.segments = [config.startPosition];
    this.segmentSet = new Set([config.startPosition.toString()]);
    this.score = 0;
    this.direction = 'up';
    this.pendingDirection = 'up';
    this.growthQueue = 0;
    this.isAlive = true;
  }

  public getPlayerId() {
    return this.id;
  }

  public getColor() {
    return this.color;
  }

  public getHead(): Point {
    return this.segments[0] as Point;
  }

  public getSegments() {
    return this.segments;
  }

  public getSegmentSet() {
    return this.segmentSet;
  }

  public kill() {
    this.isAlive = false;
  }

  public isActive() {
    return this.isAlive;
  }

  toPlayerData(): PlayerData {
    return {
      id: this.id,
      color: this.color,
      score: this.score,
    };
  }

  public grow() {
    this.score += DEFAULT_GROWTH_RATE;
    this.growthQueue += DEFAULT_GROWTH_RATE;
  }

  public move() {
    this.direction = this.pendingDirection;
    const head = this.getHead();
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

    this.segmentSet = new Set(this.segments.map((p) => p.toString()));
  }

  public setDirection(direction: Direction) {
    if (this.isValidMove(direction)) {
      this.pendingDirection = direction;
    } 
  }

  public isValidMove(proposedMove: Direction) {
    return OppositeDirection[this.direction] !== proposedMove;
  }
}
