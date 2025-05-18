import { GameEvents, GameState, SpawnService } from '@battle-snakes/shared';
import { GameEventBus } from '../events/GameEventBus';
import { NetworkGameContext } from '../core/NetworkGame';

export class LobbyService {
  private readonly gameState: GameState;
  private readonly gameEventBus: GameEventBus;
  private readonly spawnService: SpawnService;

  constructor({ gameState, gameEventBus, spawnService }: NetworkGameContext) {
    this.gameState = gameState;
    this.gameEventBus = gameEventBus;
    this.spawnService = spawnService;
  }

  public tryToAddPlayerToRoom(playerId: string, playerName: string, playerColor: string): boolean {
    // Race condition: check if there is vacancy before trying to add a player.
    if (!this.gameState.hasVacancy()) {
      return false;
    }

    const thePlayer = this.gameState.addPlayer(playerId, playerName, playerColor);
    if (this.gameState.isWaiting()) {
      this.spawnService.spawnPlayer(thePlayer);
      this.gameEventBus.emit(GameEvents.CLIENT_SPECIFIC_DATA, thePlayer.getPlayerId(), {
        isAlive: false,
        spawnPoint: thePlayer.getHead(),
      });
    }

    return true;
  }
}
