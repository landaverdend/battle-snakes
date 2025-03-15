import { Player } from '../types';

export type GameStatus = 'waiting' | 'playing' | 'finished';

enum CellType {
  Empty = 0,
  Snake = 1,
  Food = 2,
}
export interface GridState {
  width: number;
  height: number;
  cells: CellType[][];
}

export enum GameEvents {
  PLAYER_JOIN = 'game:player_join',
}

export interface GameState {
  players: Record<string, Player>;
  gridSize: {
    width: number;
    height: number;
  };
  gameStatus: GameStatus;
}
