
export interface GameConfigOptions {
  playerName: string;
  playerColor: string;
  isLocalGame: boolean;
}

export abstract class GameRunner {

  abstract start(): void;
  abstract stop(): void;
  abstract resize(width: number, height: number): void;
  abstract gameLoop(): void;

}