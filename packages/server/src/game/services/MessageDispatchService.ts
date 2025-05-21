import {
  ClientSpecificData,
  Collision,
  CollisionService,
  GameEvents,
  GameMessage,
  GameState,
  OverlayMessage,
} from '@battle-snakes/shared';
import { GameEventBus } from '../events/GameEventBus';

export class MessageDispatchService {
  constructor(
    private readonly roomId: string,
    private readonly gameState: GameState,
    private readonly gameEventBus: GameEventBus
  ) {
    this.roomId = roomId;
    this.gameEventBus = gameEventBus;
    this.gameState = gameState;
  }

  sendGameStateUpdate() {
    this.gameEventBus.emit(GameEvents.STATE_UPDATE, this.roomId, this.gameState.toSharedGameState());
  }

  sendLeaderboardUpdate() {
    this.gameEventBus.emit(
      GameEvents.LEADERBOARD_UPDATE,
      this.roomId,
      this.gameState.getPlayerData().sort((a, b) => b.score - a.score)
    );
  }

  sendOverlayMessage(overlayMessage: OverlayMessage) {
    this.gameEventBus.emit(GameEvents.OVERLAY_MESSAGE, this.roomId, overlayMessage);
  }

  sendDefaultMessage(message: string, type: GameMessage['type'] = 'default') {
    this.gameEventBus.emit(GameEvents.MESSAGE_EVENT, this.roomId, [{ type, message }]);
  }

  sendPlayerMessage(message: string, playerId: string) {
    this.gameEventBus.emit(GameEvents.MESSAGE_EVENT, this.roomId, [
      { type: 'player', message: message, playerData: this.gameState.getPlayerDataById(playerId) },
    ]);
  }

  sendClientSpecificData(playerId: string, pData: ClientSpecificData) {
    this.gameEventBus.emit(GameEvents.CLIENT_SPECIFIC_DATA, playerId, pData);
  }

  sendCollisionMessages(collisions: Collision[]) {
    this.gameEventBus.emit(GameEvents.MESSAGE_EVENT, this.roomId, CollisionService.convertCollisionsToMessages(collisions));
  }

  broadcastWaitingMessage() {
    this.sendDefaultMessage('Waiting for players...');
    this.sendOverlayMessage({ type: 'waiting', message: 'Waiting for players...' });
  }
}
