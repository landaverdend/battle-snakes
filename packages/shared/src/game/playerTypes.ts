import { Point } from './gridTypes';

export type Direction = 'up' | 'down' | 'left' | 'right';

export const OppositeDirection: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export interface Player {
  id: string;
  segments: Point[];
  direction: Direction;
  color: string;
}

// Data that is sent to the client.
export interface PlayerData {
  id: string;
  color: string;
  score: number;
}
