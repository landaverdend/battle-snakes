import { GameEvent, GameEvents, GameState, PlayerData } from '@battle-snakes/shared';
import { io, Socket } from 'socket.io-client';
import { ClientGameState } from './ClientGameState';
import { ActionFeedManager } from './ActionFeedManager';
import { LeaderboardManager } from './LeaderBoardManager';

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

    this.socket.on(GameEvents.LEADERBOARD_UPDATE, (players: PlayerData[]) => {
      LeaderboardManager.getInstance().updatePlayers(players);
    });

    this.socket.on(GameEvents.STATE_UPDATE, (state: GameState) => {
      ClientGameState.getInstance().updateState(state);
    });

    this.socket.on(GameEvents.GAME_ACTION, (action: GameEvent) => {
      ActionFeedManager.getInstance().addAction(action);
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
