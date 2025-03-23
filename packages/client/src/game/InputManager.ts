import { Direction, GameEvents } from '@battle-snakes/shared';
import { Socket } from 'socket.io-client';

export class InputManager {
  constructor(socket: Socket) {
    let direction: Direction | null = null;

    document.addEventListener('keydown', (event) => {
      console.log('keydown event!');
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
        socket.emit(GameEvents.MOVE_REQUEST, direction);
      }
    });
  }
}
