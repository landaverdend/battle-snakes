import { GameEvents, GameState } from '@battle-snakes/shared';
import { io, Socket } from 'socket.io-client';
import { ClientGameState } from './ClientGameState';

const SOCKET_URL = 'http://localhost:3001';
export class NetworkManager {
  private socket: Socket;

  constructor() {
    this.socket = io(SOCKET_URL);
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on(GameEvents.STATE_UPDATE, (state: GameState) => {
      // console.log('state update', state);
      ClientGameState.getInstance().updateState(state);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from game server');
    });
  }

  public disconnect() {
    this.socket.disconnect();
  }

  public getSocket(): Socket {
    return this.socket;
  }
}
