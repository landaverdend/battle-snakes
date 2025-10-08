import { InputHandler } from '@/game/InputHandler';
import { Direction, GameState, RoundState } from '@battle-snakes/shared';

type Input = {
  direction: Direction;
  timestamp: number;
};

export class LocalInputHandler implements InputHandler {
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

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          this.handleInput('up');
          break;
        case 'ArrowDown':
        case 's':
          this.handleInput('down');
          break;
        case 'ArrowLeft':
        case 'a':
          this.handleInput('left');
          break;
        case 'ArrowRight':
        case 'd':
          this.handleInput('right');
          break;
        default:
          return;
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

  handleInput(direction: Direction): void {
    // If the game isn't active, don't send data..
    if (this.gameState.getRoundState() !== RoundState.ACTIVE) {
      return;
    }

    if (direction) {
      // Just drop the oldest input in favor of the incoming.
      if (this.inputQueue.length < LocalInputHandler.MAX_BUFFER_SIZE) {
        this.inputQueue.push({ direction, timestamp: Date.now() });
      }
    }
  }
}
