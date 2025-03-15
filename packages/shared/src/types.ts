export interface Player {
  id: string;
  name: string;
  color: string;
  position: Point;
}

export interface Point {
  x: number;
  y: number;
}
