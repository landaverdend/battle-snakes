import { GameState, SpawnService } from '@battle-snakes/shared';
import { NetworkGameContext } from '../core/NetworkGame';
import { MessageDispatchService } from './MessageDispatchService';
import { InputBuffer } from '../input/InputBuffer';

export class LobbyService {
  private readonly gameState: GameState;
  private readonly spawnService: SpawnService;
  private readonly messageDispatchService: MessageDispatchService;
  private readonly inputBuffer: InputBuffer;

  constructor({ gameState, inputBuffer, messageDispatchService, spawnService }: NetworkGameContext) {
    this.gameState = gameState;
    this.spawnService = spawnService;
    this.messageDispatchService = messageDispatchService;
    this.inputBuffer = inputBuffer;
  }

  public tryToAddPlayerToLobby(playerId: string, playerName: string, playerColor: string): boolean {
    // Race condition: check if there is vacancy before trying to add a player.
    if (!this.gameState.hasVacancy()) {
      return false;
    }

    const thePlayer = this.gameState.addPlayer(playerId, playerName, playerColor);
    if (this.gameState.isWaiting()) {
      this.spawnService.spawnPlayer(thePlayer);

      // Send out client specific data
      this.messageDispatchService.sendClientSpecificData(thePlayer.getPlayerId(), {
        isAlive: false,
        spawnPoint: thePlayer.getHead(), // lol
      });
    }

    return true;
  }

  public removePlayerFromLobby(playerId: string) {
    this.gameState.removePlayer(playerId);
    this.inputBuffer.clearPlayer(playerId);
    this.spawnService.handlePlayerRemoval();

    // update leaderboard at the end..
    this.messageDispatchService.sendLeaderboardUpdate();
  }
}
