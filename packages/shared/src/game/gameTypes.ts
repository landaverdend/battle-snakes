import { Entity } from './gridTypes';
import { PlayerData } from './playerTypes';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export enum GameEvents {
  LEADERBOARD_UPDATE = 'game:leaderboard_update',
  STATE_UPDATE = 'game:state_update',
  MOVE_REQUEST = 'game:move_request',
  GAME_ACTION = 'game:game_action',
  PLAYER_JOIN = 'game:player_join',
  PLAYER_EXIT = 'game:player_exit',
}

export type Collision = {
  type: 'wall' | 'snake';
  playerId?: string;
  targetId?: string;
};

export interface GameEvent {
  type: 'death' | 'spawn';
  playerId: string;
  targetId?: string | undefined; // only used for death events where the player is killed by another player.
}

export interface SharedGameState {
  gridSize: number;
  grid: Record<string, Entity>;
  players: Array<PlayerData>;
}
