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
}

export enum CellType {
  Empty = 0,
  Snake = 1,
  Food = 2,
  Wall = 3
}

export type Entity = {
  type: CellType;
  playerId?: string;
  color?: string;
};
