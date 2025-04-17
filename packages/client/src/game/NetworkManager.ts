import { GameEvents, SharedGameState, PlayerData, Message } from '@battle-snakes/shared';
import { io, Socket } from 'socket.io-client';
import { ClientGameState } from './ClientGameState';
import { LeaderboardManager } from './LeaderBoardManager';
import { MessageFeedService } from './MessageFeedService';

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

    this.socket.on(GameEvents.STATE_UPDATE, (state: SharedGameState) => {
      ClientGameState.getInstance().updateState(state);
    });

    this.socket.on(GameEvents.MESSAGE_EVENT, (messages: Message[]) => {
      MessageFeedService.getInstance().addAction(messages);
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
