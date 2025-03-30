import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { GameEvents, SharedGameState } from '@battle-snakes/shared';

const PORT = process.env['PORT'] || 3001;
export class NetworkManager {
  private io: Server;

  constructor() {
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
  }

  public initialize() {
    this.io.on('connection', (socket) => this.handleConnection(socket));
  }

  private handleConnection(socket: Socket) {
    socket.on('disconnect', () => {
      console.log('Client disconnected: ', socket.id);
    });
  }

  public broadcastGameState(gameState: SharedGameState) {
    this.io.emit(GameEvents.STATE_UPDATE, gameState);
  }
}
