import { Direction, GameEvents, getCurrentTimeISOString } from '@battle-snakes/shared';
import { Socket } from 'socket.io-client';
import { ClientGameState } from '../../../state/ClientGameState';
import { ClientPlayerObservable } from '../../../state/ClientPlayerObservable';
import { InputHandler } from '@/game/InputHandler';

export class NetworkInputHandler implements InputHandler {
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

  public handleInput(dir: Direction) {
    // If the game isn't active, don't send data..
    if (!this.gameState.isRoundActive() || !this.playerState.getState().isAlive) {
      return;
    }

    console.log(`${getCurrentTimeISOString()} sending out input request: ${dir?.toString()}`);
    this.socket.emit(GameEvents.MOVE_REQUEST, { direction: dir, timestamp: Date.now() });
  }

  public destroy() {
    document.removeEventListener('keydown', this.handleKeydown);
  }
}
