import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { GameEvents } from '@battle-snakes/shared';
import EventEmitter from 'events';
import { RoomService } from '../services/RoomService';
import { GameEventBus } from '../events/GameEventBus';

const PORT = process.env['PORT'] || 3001;
export class NetworkService extends EventEmitter {
  private io: Server;

  constructor(private readonly roomService: RoomService, private readonly eventBus: GameEventBus) {
    super();

    this.io = new Server();
    const httpServer = createServer();
    this.io = new Server(httpServer, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });
    this.roomService = roomService;

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

  public initialize() {
    this.io.on('connection', (socket) => this.handleConnection(socket));
    this.setupEventListeners();
  }

  private handleConnection(socket: Socket) {
    const playerId = socket.id;
    console.log('Client connected: ', playerId);

    const roomId = this.roomService.assignPlayerToRoom(playerId);
    socket.join(roomId);

    socket.on('disconnect', () => {
      console.log('Client disconnected: ', socket.id);
      this.roomService.removePlayerFromRoom(roomId, playerId);
    });
  }

  private setupEventListeners() {
    this.eventBus.on(GameEvents.STATE_UPDATE, (roomId, state) => {
      this.io.to(roomId).emit(GameEvents.STATE_UPDATE, state);
    });

    this.eventBus.on(GameEvents.COLLISION_EVENT, (roomId, collisions) => {
      this.io.to(roomId).emit(GameEvents.COLLISION_EVENT, collisions);
    });

    this.eventBus.on(GameEvents.LEADERBOARD_UPDATE, (roomId, playerData) => {
      this.io.to(roomId).emit(GameEvents.LEADERBOARD_UPDATE, playerData);
    });
  }
}
