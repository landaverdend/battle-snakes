import { Direction, getRandomColor, PlayerData, Point } from '@battle-snakes/shared';

export type PlayerConfigOptions = {
  color?: string;
  startPosition: Point;
};
export class Player {
  private id: string;
  direction: Direction;
  color: string;
  growthQueue: number;
  segments: Point[];
  score: number;

  constructor(id: string, config: PlayerConfigOptions) {
    this.id = id;
    this.color = config.color || getRandomColor();
    this.segments = [config.startPosition];
    this.score = 0;
    this.direction = 'up';
    this.growthQueue = 0;
  }

  public getPlayerId() {
    return this.id;
  }

  public getHead(): Point {
    return this.segments[0] as Point;
  }

  toPlayerData(): PlayerData {
    return {
      id: this.id,
      color: this.color,
      score: this.score,
    };
  }

  public move() {
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
  }
}
