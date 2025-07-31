import { Direction } from '@battle-snakes/shared';

export class InputValidator {
  constructor() {}

  private isValidDirection(direction: Direction): boolean {
    switch (direction) {
      case 'up':
      case 'down':
      case 'left':
      case 'right':
        return true;
      default:
        return false;
    }
  }

  public validateInput(direction: Direction): boolean {
    return this.isValidDirection(direction);
  }
}
