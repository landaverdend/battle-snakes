import { GameEvents, GameState } from '@battle-snakes/shared';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';
let i = 0;
export class NetworkManager {
  private socket: Socket;

  constructor() {
    console.log('call ' + ++i);
    this.socket = io(SOCKET_URL);
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on(GameEvents.STATE_UPDATE, (state: GameState) => {
      console.log('Game state connection received: ', state);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from game server');
    });
  }

  public disconnect() {
    this.socket.disconnect();
  }
}
