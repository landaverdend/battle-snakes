import { Direction } from './playerTypes';

export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public equals(point: Point): boolean {
    return this.x === point.x && this.y === point.y;
  }

  public toString() {
    return `${this.x},${this.y}`;
  }

  public static parseString(str: string): Point {
    const parts = str.split(',');

    const x = Number(parts[0]);
    const y = Number(parts[1]);

    if (isNaN(x) || isNaN(y)) {
      throw new Error(`Invalid point values: ${str}`);
    }

    return new Point(x, y);
  }

  public getPointInDirection(direction: Direction): Point {
    let newPoint: Point = new Point(-1, -1);
    switch (direction) {
      case 'up':
        newPoint = new Point(this.x, this.y - 1);
        break;
      case 'down':
        newPoint = new Point(this.x, this.y + 1);
        break;
      case 'left':
        newPoint = new Point(this.x - 1, this.y);
        break;
      case 'right':
        newPoint = new Point(this.x + 1, this.y);
        break;
    }
    return newPoint;
  }

  public calculateManhattanDistance(point: Point): number {
    return Math.abs(this.x - point.x) + Math.abs(this.y - point.y);
  }

  public getAdjacentPoints(): Point[] {
    return [
      this.getPointInDirection('up'),
      this.getPointInDirection('down'),
      this.getPointInDirection('left'),
      this.getPointInDirection('right'),
    ];
  }
}

export enum CellType {
  Empty = 0,
  Snake = 1,
  Food = 2,
  Wall = 3,
}

export type Entity = {
  type: CellType;
  playerId?: string;
  color?: string;
};
