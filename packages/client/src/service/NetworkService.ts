import { GameEvents, SharedGameState, PlayerData, Message, OverlayMessage } from '@battle-snakes/shared';
import { io, Socket } from 'socket.io-client';
import { ClientGameState } from '../state/ClientGameState';
import { LeaderBoardState } from '../state/LeaderboardState';
import { MessageFeedState } from '../state/MessageFeedState';
import { GameConfigOptions } from '../game/GameClient';
import { ClientPlayerState } from '../state/ClientPlayerState';

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
      console.log(players);
      LeaderBoardState.getInstance().updateState(players);
    });

    this.socket.on(GameEvents.STATE_UPDATE, (state: SharedGameState) => {
      const latency = Date.now() - state.timestamp;
      // console.log(`state update latency ${latency}ms`);
      this.stateUpdateLatencySum += latency;
      this.stateUpdateLatencySamples++;
      this.stateUpdateLatencyAverage = this.stateUpdateLatencySum / this.stateUpdateLatencySamples;

      ClientGameState.getInstance().updateState(state);
    });

    // setInterval(() => {
    //   console.log(`State update latency average ${this.stateUpdateLatencyAverage}ms`);
    // }, 5000);

    this.socket.on(GameEvents.MESSAGE_EVENT, (messages: Message[]) => {
      MessageFeedState.getInstance().addAction(messages);
    });

    this.socket.on(GameEvents.CLIENT_STATUS_UPDATE, (playerUpdate) => {
      ClientPlayerState.getInstance().updateState(playerUpdate);
    });

    this.socket.on(GameEvents.OVERLAY_MESSAGE, (overlayMessage: OverlayMessage) => {});

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
