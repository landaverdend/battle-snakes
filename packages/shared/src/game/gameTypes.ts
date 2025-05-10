import { Entity, Point } from './gridTypes';
import { PlayerData } from './playerTypes';

export enum GameEvents {
  STATE_UPDATE = 'game:state_update',
  MOVE_REQUEST = 'game:move_request',
  MESSAGE_EVENT = 'game:message_event',
  LEADERBOARD_UPDATE = 'game:leaderboard_update',
  PLAYER_JOIN = 'game:player_join',
  PLAYER_EXIT = 'game:player_exit',
  CLIENT_STATUS_UPDATE = 'game:client_status_update',
  OVERLAY_MESSAGE = 'game:overlay_message',
  INPUT_RATE_LIMIT_EXCEEDED = 'game:input_rate_limit_exceeded',
}

export type Message = {
  type: 'collision' | 'player_join' | 'player_exit' | 'default';
  message: string;
};

export enum RoundState {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COUNTDOWN = 'countdown',
}

export type Collision = {
  type: 'wall' | 'snake' | 'food' | 'self';
  playerId: string;
  playerName: string;
  otherPlayerId?: string;
  otherPlayerName?: string;
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
  timestamp: number;
}

export type OverlayMessage = {
  type: 'round_over' | 'game_over' | 'countdown' | 'waiting' | 'clear';
  message?: string;
  player?: PlayerData | undefined;
};
