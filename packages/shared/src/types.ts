export interface Point {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';
export interface Player {
  id: string;
  segments: Point[];
  direction: Direction;
  color: string;
}
