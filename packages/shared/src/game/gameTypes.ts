import { Entity } from './gridTypes';
import { PlayerData } from './playerTypes';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export enum GameEvents {
  STATE_UPDATE = 'game:state_update',
  MOVE_REQUEST = 'game:move_request',
  COLLISION_EVENT = 'game:collision_event',
  LEADERBOARD_UPDATE = 'game:leaderboard_update',
  PLAYER_JOIN = 'game:player_join',
  PLAYER_EXIT = 'game:player_exit',
}

export type Collision = {
  type: 'wall' | 'snake' | 'food' | 'self';
  playerId: string;
  otherPlayerId?: string;
};

export interface SharedGameState {
  gridSize: number;
  grid: Record<string, Entity>;
  players: Array<PlayerData>;
}
