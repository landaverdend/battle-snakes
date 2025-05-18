import { GameConfigOptions, GameRunner } from '../GameRunner';

export class LocalGameRunner extends GameRunner {
  
  constructor(ctx: CanvasRenderingContext2D, gameConfig: GameConfigOptions) {
    super(ctx);
  }

  override start(): void {
    throw new Error('Method not implemented.');
  }
  override stop(): void {
    throw new Error('Method not implemented.');
  }
  override resize(width: number, height: number): void {
    throw new Error('Method not implemented.');
  }
  override gameLoop(): void {
    throw new Error('Method not implemented.');
  }
}
