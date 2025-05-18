import { GameEvents, GameState, SpawnService } from '@battle-snakes/shared';
import { NetworkGameContext } from '../core/NetworkGame';
import { MessageDispatchService } from './MessageDispatchService';

export class LobbyService {
  private readonly gameState: GameState;
  private readonly spawnService: SpawnService;
  private readonly messageDispatchService: MessageDispatchService;

  constructor({ gameState, messageDispatchService, spawnService }: NetworkGameContext) {
    this.gameState = gameState;
    this.spawnService = spawnService;
    this.messageDispatchService = messageDispatchService;
  }

  public tryToAddPlayerToRoom(playerId: string, playerName: string, playerColor: string): boolean {
    // Race condition: check if there is vacancy before trying to add a player.
    if (!this.gameState.hasVacancy()) {
      return false;
    }

    const thePlayer = this.gameState.addPlayer(playerId, playerName, playerColor);
    if (this.gameState.isWaiting()) {
      this.spawnService.spawnPlayer(thePlayer);

      this.messageDispatchService.sendClientSpecificData(thePlayer.getPlayerId(), {
        isAlive: false,
        spawnPoint: thePlayer.getHead(),
      });
    }

    return true;
  }
}
