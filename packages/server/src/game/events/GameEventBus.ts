import { ClientStatusUpdate, GameEvents, Message, PlayerData, SharedGameState } from '@battle-snakes/shared';
import EventEmitter from 'events';

export interface GameEventPayloads {
  [GameEvents.STATE_UPDATE]: [roomId: string, state: SharedGameState];
  [GameEvents.LEADERBOARD_UPDATE]: [roomId: string, playerData: PlayerData[]];
  [GameEvents.MESSAGE_EVENT]: [roomId: string, message: Message[]];
  [GameEvents.CLIENT_STATUS_UPDATE]: [socketId: string, playerUpdate: ClientStatusUpdate];
}

export class GameEventBus extends EventEmitter {
  override emit<E extends keyof GameEventPayloads>(event: E, ...args: GameEventPayloads[E]): boolean {
    return super.emit(event, ...args);
  }

  override on<E extends keyof GameEventPayloads>(event: E, listener: (...args: GameEventPayloads[E]) => void): this {
    return super.on(event, listener);
  }

  emitMessage(roomId: string, message: string) {
    this.emit(GameEvents.MESSAGE_EVENT, roomId, [{ type: 'default', message }]);
  }

  emitPlayerJoin(roomId: string, playerName: string) {
    this.emit(GameEvents.MESSAGE_EVENT, roomId, [{ type: 'player_join', message: `${playerName} has joined the game` }]);
  }

  emitPlayerExit(roomId: string, playerName: string) {
    this.emit(GameEvents.MESSAGE_EVENT, roomId, [{ type: 'player_exit', message: `${playerName} has left the game` }]);
  }
}
