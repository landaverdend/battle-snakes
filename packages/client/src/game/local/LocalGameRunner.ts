import { DEFAULT_GRID_SIZE } from '@battle-snakes/shared';
import { GameConfigOptions, GameRunner } from '../GameRunner';
import { LocalGame } from './LocalGame';

export class LocalGameRunner extends GameRunner {
  private game: LocalGame;

  constructor(ctx: CanvasRenderingContext2D, gameConfig: GameConfigOptions) {
    super(ctx);

    this.game = new LocalGame(DEFAULT_GRID_SIZE);
  }

  start(): void {
    this.game.start();
  }

  stop(): void {
    this.game.stop();
  }
}
