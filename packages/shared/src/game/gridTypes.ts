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
}

export enum CellType {
  Empty = 0,
  Snake = 1,
  Food = 2,
}

export type GridCell = {
  type: CellType;
  playerId?: string;
};

export interface GridState {
  width: number;
  height: number;
  cells?: GridCell[][]; // Server only needs to know the width and height
}
