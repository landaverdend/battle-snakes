import { GameEvents, SharedGameState, PlayerData, GameMessage, OverlayMessage, ClientSpecificData } from '@battle-snakes/shared';
import { io, Socket } from 'socket.io-client';
import { ClientGameState } from '../state/ClientGameState';
import { LeaderboardObservable } from '../state/LeaderboardObservable';
import { MessageFeedObservable } from '../state/MessageFeedObservable';
import { GameConfigOptions } from '../game/GameClient';
import { ClientPlayerObservable } from '../state/ClientPlayerObservable';
import { OverlayMessageEventBus } from './OverlayMessageEventBus';

const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:3030' : window.location.origin;

export class NetworkService {
  private socket: Socket;

  private stateUpdateLatencySum = 0;
  private stateUpdateLatencyAverage = 0;
  private stateUpdateLatencySamples = 0;

  constructor({ playerName, playerColor, isCpuGame }: GameConfigOptions) {
    this.socket = io(SOCKET_URL, { auth: { playerName, playerColor, isCpuGame } });
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
      const latency = Date.now() - state.timestamp;
      // console.log(`state update latency ${latency}ms`);
      this.stateUpdateLatencySum += latency;
      this.stateUpdateLatencySamples++;
      this.stateUpdateLatencyAverage = this.stateUpdateLatencySum / this.stateUpdateLatencySamples;

      ClientGameState.getInstance().publish(state);
    });

    // setInterval(() => {
    //   console.log(`State update latency average ${this.stateUpdateLatencyAverage}ms`);
    // }, 5000);

    this.socket.on(GameEvents.MESSAGE_EVENT, (messages: GameMessage[]) => {
      MessageFeedObservable.getInstance().publishMessages(messages);
    });

    this.socket.on(GameEvents.CLIENT_SPECIFIC_DATA, (playerUpdate: ClientSpecificData) => {
      console.log('client specific data', playerUpdate);
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
