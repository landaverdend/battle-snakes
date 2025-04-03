import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { Collision, GameEvents, PlayerData, SharedGameState } from '@battle-snakes/shared';
import EventEmitter from 'events';
import { RoomManager } from './RoomManager';

const PORT = process.env['PORT'] || 3001;
export class NetworkManager extends EventEmitter {
  private static instance: NetworkManager;
  private io: Server;

  private constructor() {
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
  }

  public static getInstance() {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }

    return NetworkManager.instance;
  }

  public initialize() {
    this.io.on('connection', (socket) => this.handleConnection(socket));
  }

  private handleConnection(socket: Socket) {
    const playerId = socket.id;
    console.log('Client connected: ', playerId);

    const roomId = RoomManager.getInstance().assignPlayerToRoom(playerId);
    socket.join(roomId);

    socket.on('disconnect', () => {
      console.log('Client disconnected: ', socket.id);
      RoomManager.getInstance().removePlayerFromRoom(roomId, playerId);
    });
  }

  public broadcastGameState(roomId: string, gameState: SharedGameState) {
    this.io.to(roomId).emit(GameEvents.STATE_UPDATE, gameState);
  }

  public broadcastCollision(roomId: string, collision: Collision[]) {
    this.io.to(roomId).emit(GameEvents.COLLISION_EVENT, collision);
  }

  public broadcastLeaderboardUpdate(roomId: string, players: PlayerData[]) {
    this.io.to(roomId).emit(GameEvents.LEADERBOARD_UPDATE, players);
  }
}
