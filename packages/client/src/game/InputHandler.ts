import { Direction } from '@battle-snakes/shared';

export interface InputHandler {
  handleInput(dir: Direction): void;
}
