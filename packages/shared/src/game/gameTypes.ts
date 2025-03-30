import { SharedGridState } from './gridTypes';
import { PlayerData } from './playerTypes';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export enum GameEvents {
  LEADERBOARD_UPDATE = 'game:leaderboard_update',
  STATE_UPDATE = 'game:state_update',
  MOVE_REQUEST = 'game:move_request',
  GAME_ACTION = 'game:game_action',
}

export interface GameEvent {
  type: 'death' | 'spawn';
  playerId: string;
  targetId?: string | undefined; // only used for death events where the player is killed by another player.
}

export interface SharedGameState {
  board: SharedGridState;
  players: Array<PlayerData>;
}
