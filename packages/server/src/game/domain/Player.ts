import { Direction, getRandomColor, OppositeDirection, PlayerData, Point } from '@battle-snakes/shared';
import { DEFAULT_GROWTH_RATE } from '../../config/gameConfig';

export type PlayerConfigOptions = {
  color?: string;
  startPosition: Point;
  isAlive?: boolean;
  name: string;
};
export class Player {
  private id: string;
  name: string;
  direction: Direction;
  pendingDirection: Direction;
  color: string;
  growthQueue: number;

  segments: Point[];
  segmentSet: Set<string>;

  score: number;
  isAlive: boolean;

  constructor(id: string, { color, startPosition, isAlive, name }: PlayerConfigOptions) {
    this.id = id;
    this.name = name;
    this.color = color || getRandomColor();
    this.segments = [startPosition];
    this.segmentSet = new Set([startPosition.toString()]);
    this.score = 0;
    this.direction = 'up';
    this.pendingDirection = 'up';
    this.growthQueue = 0;
    this.isAlive = isAlive ?? false;
  }

  // Initialize the player for a new round.
  public resetForRound(position: Point) {
    this.segments = [position];
    this.segmentSet = new Set([position.toString()]);
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

  public getPlayerName() {
    return this.name;
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

  public setAlive() {
    this.isAlive = true;
  }

  public isActive() {
    return this.isAlive;
  }

  toPlayerData(): PlayerData {
    return {
      name: this.name,
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
