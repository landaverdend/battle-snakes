export interface Point {
  x: number;
  y: number;
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
