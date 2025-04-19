import { Entity, Point } from './gridTypes';
import { PlayerData } from './playerTypes';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export enum GameEvents {
  STATE_UPDATE = 'game:state_update',
  MOVE_REQUEST = 'game:move_request',
  MESSAGE_EVENT = 'game:message_event',
  LEADERBOARD_UPDATE = 'game:leaderboard_update',
  PLAYER_JOIN = 'game:player_join',
  PLAYER_EXIT = 'game:player_exit',
}

export type Message = {
  type: 'collision' | 'player_join' | 'player_exit';
  message: string;
};

export enum RoundState {
  WAITING = 'waiting',
  ACTIVE = 'active',
  INTERMISSION = 'intermission',
}

export type Collision = {
  type: 'wall' | 'snake' | 'food' | 'self';
  playerId: string;
  otherPlayerId?: string;
  point: Point;
};

export interface RoundInfo {
  roundNumber: number;
  roundState: RoundState;
  roundIntermissionEndTime: number | null;
}

export interface SharedGameState {
  gridSize: number;
  grid: Record<string, Entity>;
  players: Array<PlayerData>;
  roundInfo: RoundInfo;
}
