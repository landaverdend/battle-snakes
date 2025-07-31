import { GameEvents, SharedGameState, PlayerData, GameMessage, OverlayMessage, ClientSpecificData } from '@battle-snakes/shared';
import { io, Socket } from 'socket.io-client';
import { ClientGameState } from '../../../state/ClientGameState';
import { LeaderboardObservable } from '../../../state/LeaderboardObservable';
import { MessageFeedObservable, publishMessage } from '../../../state/MessageFeedObservable';
import { ClientPlayerObservable } from '../../../state/ClientPlayerObservable';
import { OverlayMessageEventBus } from '../../../service/OverlayMessageEventBus';
import { GameConfigOptions } from '@/game/GameRunner';

const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:3030' : window.location.origin;

export class ConnectionService {
  private socket: Socket;

  constructor({ playerName, playerColor }: GameConfigOptions) {
    this.socket = io(SOCKET_URL, { auth: { playerName, playerColor } });
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on(GameEvents.LEADERBOARD_UPDATE, (players: PlayerData[]) => {
      LeaderboardObservable.getInstance().publish(players);
    });

    this.socket.on(GameEvents.STATE_UPDATE, (state: SharedGameState) => {
      ClientGameState.getInstance().publish(state);
    });

    this.socket.on(GameEvents.MESSAGE_EVENT, (messages: GameMessage[]) => {
      publishMessage(messages);
    });

    this.socket.on(GameEvents.CLIENT_SPECIFIC_DATA, (playerUpdate: ClientSpecificData) => {
      ClientPlayerObservable.getInstance().publish(playerUpdate);
    });

    this.socket.on(GameEvents.OVERLAY_MESSAGE, (overlayMessage: OverlayMessage) => {
      OverlayMessageEventBus.getInstance().publish(overlayMessage);
    });

    this.socket.on(GameEvents.SERVER_WARNING, (warning: string) => {
      alert(warning);
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
