import { GridCell, GridState } from './gridTypes';
import { Player } from './playerTypes';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export enum GameEvents {
  PLAYER_JOIN = 'game:player_join',
  STATE_UPDATE = 'game:state_update',
  MOVE_REQUEST = 'game:move_request',
  GAME_ACTION = 'game:game_action',
}

export interface GameAction {
  type: 'kill' | 'death' | 'spawn';
  playerId: string;
  targetId?: string | undefined;
}

// A smarter way of handling state updates
export interface GameState {
  gridState: GridState;
  players: Record<string, Player>;
  occupiedCells: Record<string, GridCell>;
}
