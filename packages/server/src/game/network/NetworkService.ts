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
    console.log('A user connected:', playerId);

    try {
      const roomId = this.roomService.assignPlayerToRoom(playerId);
      socket.join(roomId);

      const game = this.roomService.getGameByRoomId(roomId);
      if (game) {
        this.eventBus.emit(GameEvents.LEADERBOARD_UPDATE, roomId, game.getPlayerData());
        this.eventBus.emit(GameEvents.MESSAGE_EVENT, roomId, [
          { type: 'player_join', message: `${playerId} has joined the game.` },
        ]);
      } else {
        console.error(`Game instance not found for room ${roomId} after player assignment.`);
      }

      socket.on(GameEvents.MOVE_REQUEST, (direction) => {
        const game = this.roomService.getGameByRoomId(roomId);
        if (game) {
          game.getInputBuffer().addInput(playerId, direction);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', playerId);
        this.roomService.removePlayerFromRoom(roomId, playerId);
        this.eventBus.emitPlayerExit(roomId, playerId);
      });
    } catch (error) {
      console.error('Failed to handle connection:', error);
      socket.disconnect(true);
    }
  }

  private setupEventListeners() {
    this.eventBus.on(GameEvents.STATE_UPDATE, (roomId, state) => {
      this.io.to(roomId).emit(GameEvents.STATE_UPDATE, state);
    });

    this.eventBus.on(GameEvents.MESSAGE_EVENT, (roomId, messages) => {
      this.io.to(roomId).emit(GameEvents.MESSAGE_EVENT, messages);
    });

    this.eventBus.on(GameEvents.LEADERBOARD_UPDATE, (roomId, playerData) => {
      this.io.to(roomId).emit(GameEvents.LEADERBOARD_UPDATE, playerData);
    });
  }
}
