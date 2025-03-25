import { Direction, GameEvents } from '@battle-snakes/shared';
import { Socket } from 'socket.io-client';

export class InputManager {
  private socket: Socket;
  private handleKeydown: (event: KeyboardEvent) => void;

  constructor(socket: Socket) {
    this.socket = socket;

    this.handleKeydown = this.createKeydownHandler();
    document.addEventListener('keydown', this.handleKeydown);
  }

  private createKeydownHandler() {
    return (event: KeyboardEvent) => {
      event.preventDefault(); 
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
      }

      if (direction) {
        this.socket.emit(GameEvents.MOVE_REQUEST, direction);
      }
    };
  }

  public destroy() {
    document.removeEventListener('keydown', this.handleKeydown);
  }
}
