import { Direction, GameState, RoundState } from '@battle-snakes/shared';

type Input = {
  direction: Direction;
  timestamp: number;
};

export class InputBuffer {
  private gameState: GameState;

  private handleKeydown: (event: KeyboardEvent) => void;

  private static readonly MAX_BUFFER_SIZE = 4;
  private inputQueue: Input[] = []; // TODO: make this a priority queue.

  constructor(gameState: GameState) {
    this.gameState = gameState;

    this.handleKeydown = this.createKeydownHandler();
    document.addEventListener('keydown', this.handleKeydown);
  }

  private createKeydownHandler() {
    return (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }
      // If the game isn't active, don't send data..
      if (this.gameState.getRoundState() !== RoundState.ACTIVE) {
        return;
      }

      let direction: Direction | null = null;

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          direction = 'up';
          break;
        case 'ArrowDown':
        case 's':
          direction = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
          direction = 'left';
          break;
        case 'ArrowRight':
        case 'd':
          direction = 'right';
          break;
        default:
          return;
      }

      if (direction) {
        // Just drop the oldest input in favor of the incoming.
        if (this.inputQueue.length < InputBuffer.MAX_BUFFER_SIZE) {
          this.inputQueue.push({ direction, timestamp: Date.now() });
        }
      }
    };
  }

  getNextInput(): Direction | undefined {
    if (this.inputQueue.length > 0) {
      this.inputQueue.sort((a, b) => a.timestamp - b.timestamp);
      const oldestInput = this.inputQueue.shift();
      return oldestInput?.direction;
    }

    return undefined;
  }
}
