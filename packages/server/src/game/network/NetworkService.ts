import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { GameEvents } from '@battle-snakes/shared';
import EventEmitter from 'events';
import { RoomService } from '../services/RoomService';
import { GameEventBus } from '../events/GameEventBus';
import { ROOM_CLEANUP_INTERVAL_MS } from '../../config/gameConfig';

const PORT = process.env['PORT'] || 3030;
export class NetworkService extends EventEmitter {
  private io: Server;

  constructor(private readonly roomService: RoomService, private readonly eventBus: GameEventBus) {
    super();

    this.io = new Server();
    const httpServer = createServer();
    this.io = new Server(httpServer, {
      cors: {
        origin: ['http://localhost:3000', 'https://battlesnakes.io'],
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
    this.setupCleanupInterval();
  }

  private handleConnection(socket: Socket) {
    const playerId = socket.id;
    console.log('A user connected:', playerId);
    const { playerName, playerColor, isCpuGame } = socket.handshake.auth;
    try {
      console.log(`Player name: ${playerName}, Player color: ${playerColor} has joined.`);
      if (!playerName) {
        throw new Error('Player name is required');
      }

      let roomId = '';
      if (isCpuGame) {
        roomId = this.roomService.assignPlayerToCpuGame(playerId, playerName, playerColor);
      } else {
        roomId = this.roomService.assignPlayerToRoom(playerId, playerName, playerColor);
      }
      socket.join(roomId);

      const game = this.roomService.getGameByRoomId(roomId);
      if (game) {
        this.eventBus.emit(GameEvents.LEADERBOARD_UPDATE, roomId, game.getPlayerData());
        this.eventBus.emitPlayerJoin(roomId, playerName);
      } else {
        console.error(`Game instance not found for room ${roomId} after player assignment.`);
      }

      socket.on(GameEvents.MOVE_REQUEST, (direction) => {
        const game = this.roomService.getGameByRoomId(roomId);
        if (game) {
          game.handlePlayerInput(playerId, direction);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', playerId);
        this.roomService.removePlayerFromRoom(roomId, playerId);
        this.eventBus.emitPlayerExit(roomId, playerName);
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

  private setupCleanupInterval() {
    setInterval(() => {
      console.log('Room cleanup interval triggered');
      this.roomService.cleanup();
    }, ROOM_CLEANUP_INTERVAL_MS);
  }
}
