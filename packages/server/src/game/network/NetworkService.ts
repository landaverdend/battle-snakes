import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { GameEvents, MAX_CHAT_MESSAGE_LENGTH, MoveRequest, ROOM_CLEANUP_INTERVAL_MS } from '@battle-snakes/shared';
import EventEmitter from 'events';
import { RoomService } from '../services/RoomService';
import { GameEventBus } from '../events/GameEventBus';
import { RateLimiter } from './RateLimiter';
import { CooldownManager } from './CooldownManager';

const PORT = process.env['PORT'] || 3030;
export class NetworkService extends EventEmitter {
  private io: Server;
  private bannedIPs: Set<string> = new Set<string>();

  private connectionRateLimiter: RateLimiter;
  private chatRateLimiter: RateLimiter;
  private chatCooldownManager: CooldownManager;

  constructor(private readonly roomService: RoomService, private readonly eventBus: GameEventBus) {
    super();

    this.io = new Server();
    const httpServer = createServer();
    this.io = new Server(httpServer, {
      cors: {
        origin: ['http://localhost:3000', 'https://battlesnakes.io'],
        methods: ['GET', 'POST'],
      },
      maxHttpBufferSize: 1024, // limit message size to 1kb
      pingTimeout: 10000,
      pingInterval: 5000,
    });
    this.roomService = roomService;

    // If a user trys to connect more than 30 times a minute, IP ban them lol
    this.connectionRateLimiter = new RateLimiter({
      maxActions: 30,
      windowMS: 60000,
      onLimitExceeded: (ip) => {
        this.bannedIPs.add(ip);
      },
    });

    this.chatRateLimiter = new RateLimiter({
      maxActions: 4,
      windowMS: 5000,
      onLimitExceeded: (playerId) => {},
    });

    this.chatCooldownManager = new CooldownManager({
      cooldownMS: 10000,
    });

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

  public initialize() {
    this.io.on('connection', (socket) => this.handleConnection(socket));
    this.setupEventBusListeners();
    this.setupCleanupInterval();
  }

  private handleConnection(socket: Socket) {
    const playerId = socket.id;
    const clientIp = this.getClientIP(playerId);

    if (clientIp && !this.connectionRateLimiter.tryAction(clientIp)) {
      console.warn('Connection rate limit exceeded for IP: ', clientIp);
      socket.disconnect(true);
      return;
    }

    console.log('A user connected:', playerId, ' from IP: ', clientIp);
    const { playerName, playerColor, isCpuGame } = socket.handshake.auth;

    if (clientIp && this.bannedIPs.has(clientIp)) {
      console.log(`IP ${clientIp} is banned. Disconnecting.`);
      socket.disconnect(true);
      return;
    }

    try {
      console.log(`Player name: ${playerName} has joined.`);
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
        this.eventBus.emit(GameEvents.MESSAGE_EVENT, roomId, [
          { type: 'player', message: '{playerName} has joined the game', playerData: game.getPlayerDataById(playerId) },
        ]);
      } else {
        console.error(`Game instance not found for room ${roomId} after player assignment.`);
      }

      socket.on(GameEvents.MOVE_REQUEST, (moveRequest: MoveRequest) => {
        console.log(`Latency for move request: ${Date.now() - moveRequest.timestamp}ms`);

        const game = this.roomService.getGameByRoomId(roomId);
        if (game) {
          game.handlePlayerInput(playerId, moveRequest.direction);
        }
      });

      socket.on(GameEvents.CHAT_MESSAGE, (message: string) => {
        if (message.length > MAX_CHAT_MESSAGE_LENGTH) return;

        const playerKey = clientIp || playerId;

        // Check if a cooldown has been applied to player chats...
        if (this.chatCooldownManager.isCooldownActive(playerKey)) {
          this.io.to(playerId).emit(GameEvents.SERVER_WARNING, 'Still on cooldown.');
          return;
        } else if (!this.chatRateLimiter.tryAction(playerKey)) {
          this.io.to(playerId).emit(GameEvents.SERVER_WARNING, 'Stop spamming. Chat disabled for 10s');
          this.chatCooldownManager.addCooldown(playerKey);
          return;
        }

        this.eventBus.emit(GameEvents.MESSAGE_EVENT, roomId, [
          {
            type: 'chat',
            message: `{playerName}: ${message}`,
            playerData: game?.getPlayerDataById(playerId),
          },
        ]);
      });

      socket.on('disconnect', () => {
        const game = this.roomService.getGameByRoomId(roomId);
        if (game) {
          this.eventBus.emit(GameEvents.MESSAGE_EVENT, roomId, [
            { type: 'player', message: '{playerName} has left the game', playerData: game?.getPlayerDataById(playerId) },
          ]);
        }

        console.log('User disconnected:', playerId);
        this.roomService.removePlayerFromRoom(roomId, playerId);
      });
    } catch (error) {
      console.error('Failed to handle connection:', error);
      socket.disconnect(true);
    }
  }

  private setupEventBusListeners() {
    this.eventBus.on(GameEvents.STATE_UPDATE, (roomId, state) => {
      this.io.to(roomId).emit(GameEvents.STATE_UPDATE, state);
    });

    this.eventBus.on(GameEvents.MESSAGE_EVENT, (roomId, messages) => {
      this.io.to(roomId).emit(GameEvents.MESSAGE_EVENT, messages);
    });

    this.eventBus.on(GameEvents.LEADERBOARD_UPDATE, (roomId, playerData) => {
      this.io.to(roomId).emit(GameEvents.LEADERBOARD_UPDATE, playerData);
    });

    this.eventBus.on(GameEvents.CLIENT_STATUS_UPDATE, (socketId, clientStatusUpdate) => {
      this.io.to(socketId).emit(GameEvents.CLIENT_STATUS_UPDATE, clientStatusUpdate);
    });

    this.eventBus.on(GameEvents.OVERLAY_MESSAGE, (roomId, message) => {
      this.io.to(roomId).emit(GameEvents.OVERLAY_MESSAGE, message);
    });

    // IP ban and disconnect player if they exceed the input rate limit
    this.eventBus.on(GameEvents.INPUT_RATE_LIMIT_EXCEEDED, (playerId) => {
      this.banAndDisconnectPlayer(playerId);
    });
  }

  private getClientIP(playerId: string) {
    const handshake = this.io.sockets.sockets.get(playerId)?.handshake;

    let clientIP: string | string[] | undefined = '';
    if (handshake && handshake?.headers) {
      const { headers } = handshake;
      console.log('Headers:', headers);
      clientIP = headers['x-real-ip'] || headers['x-forwarded-for'];

      // X-Forwarded-For can be a comma-separated string or an array.
      // We usually want the first IP in the list, which is the original client.
      if (clientIP) {
        if (Array.isArray(clientIP)) {
          clientIP = clientIP[0];
        } else if (typeof clientIP === 'string' && clientIP.includes(',')) {
          clientIP = clientIP.split(',')[0]?.trim();
        }
      }

      // Ensure clientIp is a string at this point if found
      if (typeof clientIP !== 'string') {
        console.warn(`Could not determine client IP. Headers:`, headers);
      }
    }

    return clientIP;
  }

  private banAndDisconnectPlayer(playerId: string) {
    const clientIp = this.getClientIP(playerId);
    console.warn(`Banning IP for player ${playerId} and IP: ${clientIp}`);

    if (clientIp) {
      this.bannedIPs.add(clientIp);
    }

    this.io.to(playerId).disconnectSockets(true);
  }

  private setupCleanupInterval() {
    setInterval(() => {
      console.log('Room cleanup interval triggered');
      this.roomService.cleanup();
    }, ROOM_CLEANUP_INTERVAL_MS);
  }
}
