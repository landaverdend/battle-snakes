import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { GameEvents, SharedGameState } from '@battle-snakes/shared';
import EventEmitter from 'events';

const PORT = process.env['PORT'] || 3001;
export class NetworkManager extends EventEmitter {
  private io: Server;

  constructor() {
    super();
    this.io = new Server();
    const httpServer = createServer();
    this.io = new Server(httpServer, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    this.initialize();
  }

  public initialize() {
    this.io.on('connection', (socket) => this.handleConnection(socket));
  }

  private handleConnection(socket: Socket) {
    const playerId = socket.id;
    console.log('Client connected: ', playerId);

    this.emit(GameEvents.PLAYER_JOIN, playerId);

    socket.on('disconnect', () => {
      console.log('Client disconnected: ', playerId);
      this.emit(GameEvents.PLAYER_EXIT, playerId);
    });
  }

  public broadcastGameState(gameState: SharedGameState) {
    this.io.emit(GameEvents.STATE_UPDATE, gameState);
  }

  public onPlayerJoin(callback: (playerId: string) => void) {
    this.on(GameEvents.PLAYER_JOIN, callback);
  }

  public onPlayerExit(callback: (playerId: string) => void) {
    this.on(GameEvents.PLAYER_EXIT, callback);
  }
}
