import { GridState } from './gridTypes';
import { Player } from './playerTypes';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export enum GameEvents {
  PLAYER_JOIN = 'game:player_join',
  STATE_UPDATE = 'game:state_update',
  MOVE_REQUEST = 'game:move_request',
}

export interface GameState {
  players: Record<string, Player>;
  gridState: GridState;
  gameStatus: GameStatus;
}
