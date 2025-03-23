import { Player } from '../types';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export enum CellType {
  Empty = 0,
  Snake = 1,
  Food = 2,
}

export type GridCell = {
  type: CellType;
  playerId?: string;
};

export interface GridState {
  width: number;
  height: number;
  cells: GridCell[][];
}

export enum GameEvents {
  PLAYER_JOIN = 'game:player_join',
  STATE_UPDATE = 'game:state_update',
}

export interface GameState {
  players: Record<string, Player>;
  gridState: GridState;
  gameStatus: GameStatus;
}
