import { Collision, GameEvents, PlayerData, SharedGameState } from '@battle-snakes/shared';
import EventEmitter from 'events';

export interface GameEventPayloads {
  [GameEvents.STATE_UPDATE]: [roomId: string, state: SharedGameState];
  [GameEvents.COLLISION_EVENT]: [roomId: string, collisions: Collision[]];
  [GameEvents.LEADERBOARD_UPDATE]: [roomId: string, playerData: PlayerData[]];
}

export class GameEventBus extends EventEmitter {
  override emit<E extends keyof GameEventPayloads>(event: E, ...args: GameEventPayloads[E]): boolean {
    return super.emit(event, ...args);
  }

  override on<E extends keyof GameEventPayloads>(event: E, listener: (...args: GameEventPayloads[E]) => void): this {
    return super.on(event, listener);
  }
}
