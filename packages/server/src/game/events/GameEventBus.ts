import { ClientSpecificData, GameEvents, GameMessage, OverlayMessage, PlayerData, SharedGameState } from '@battle-snakes/shared';
import EventEmitter from 'events';

export interface GameEventPayloads {
  [GameEvents.STATE_UPDATE]: [roomId: string, state: SharedGameState];
  [GameEvents.LEADERBOARD_UPDATE]: [roomId: string, playerData: PlayerData[]];
  [GameEvents.MESSAGE_EVENT]: [roomId: string, message: GameMessage[]];
  [GameEvents.CLIENT_SPECIFIC_DATA]: [socketId: string, playerUpdate: ClientSpecificData];
  [GameEvents.OVERLAY_MESSAGE]: [roomId: string, overlayMessage: OverlayMessage];
  [GameEvents.INPUT_RATE_LIMIT_EXCEEDED]: [playerId: string];
}

export class GameEventBus extends EventEmitter {
  override emit<E extends keyof GameEventPayloads>(event: E, ...args: GameEventPayloads[E]): boolean {
    return super.emit(event, ...args);
  }

  override on<E extends keyof GameEventPayloads>(event: E, listener: (...args: GameEventPayloads[E]) => void): this {
    return super.on(event, listener);
  }
}
