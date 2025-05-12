import { Direction, GameEvents, getCurrentTimeISOString } from '@battle-snakes/shared';
import { Socket } from 'socket.io-client';
import { ClientGameState } from '../state/ClientGameState';
import { ClientPlayerObservable } from '../state/ClientPlayerObservable';

export class InputService {
  private socket: Socket;
  private handleKeydown: (event: KeyboardEvent) => void;
  private gameState: ClientGameState;
  private playerState: ClientPlayerObservable;

  constructor(socket: Socket) {
    this.socket = socket;
    this.gameState = ClientGameState.getInstance();
    this.playerState = ClientPlayerObservable.getInstance();

    this.handleKeydown = this.createKeydownHandler();
    document.addEventListener('keydown', this.handleKeydown);
  }

  private createKeydownHandler() {
    return (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }
      // If the game isn't active, don't send data..
      if (!this.gameState.isRoundActive() || !this.playerState.getState().isAlive) {
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

      console.log(`${getCurrentTimeISOString()} sending out input request: ${direction?.toString()}`);
      this.socket.emit(GameEvents.MOVE_REQUEST, { direction: direction, timestamp: Date.now() });
    };
  }

  public destroy() {
    document.removeEventListener('keydown', this.handleKeydown);
  }
}
