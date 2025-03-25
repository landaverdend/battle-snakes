import { GridState, Point } from './gridTypes';
import { Player } from './playerTypes';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export enum GameEvents {
  PLAYER_JOIN = 'game:player_join',
  STATE_UPDATE = 'game:state_update',
  MOVE_REQUEST = 'game:move_request',
}

// A smarter way of handling state updates
export interface GameState {
  gridState: GridState;
  foodPositions: Point[];
  players: Record<string, Player>;
}
