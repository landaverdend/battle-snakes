import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { Direction, GameEvent, GameEvents } from '@battle-snakes/shared';
import GameState from './GameState';

const PORT = process.env['PORT'] || 3001;

export class NetworkManager {
  private io: Server;
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;

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

  // catch all for different connection events...
  private handleConnection(socket: Socket) {
    this.gameState.addPlayer(socket.id);
    this.broadcastLeaderboardUpdate(); // update the leaderboard with the new player.

    socket.on(GameEvents.MOVE_REQUEST, (direction: Direction) => {
      const player = this.gameState.getPlayers().get(socket.id);
      if (player && player.isValidMove(direction)) {
        player.setDirection(direction);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected: ', socket.id);
      this.gameState.removePlayer(socket.id);
      this.io.emit(GameEvents.LEADERBOARD_UPDATE, Array.from(this.gameState.getPlayers().keys()));
      this.broadcastLeaderboardUpdate(); // remove the player from the leaderboard.
    });
  }

  public broadCastGameState() {
    this.io.emit(GameEvents.STATE_UPDATE, this.gameState.serialize());
  }

  public broadcastGameEvent(action: GameEvent) {
    this.io.emit(GameEvents.GAME_ACTION, action);
  }

  public broadcastLeaderboardUpdate() {
    const leaderboardData = this.gameState.getLeaderboardData();
    this.io.emit(GameEvents.LEADERBOARD_UPDATE, leaderboardData); // We can reuse the existing event
  }
}
