export type Direction = 'up' | 'down' | 'left' | 'right';

export const OppositeDirection: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

// Data that is sent to the client.
export interface PlayerData {
  color: string;
  name: string;
  score: number;
}

// Server to client messages
export interface ClientStatusUpdate {
  isAlive?: boolean;
  message?: string;
}
