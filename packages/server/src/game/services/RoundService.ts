import { GameState, OverlayMessage } from '@battle-snakes/shared';
import { NetworkGameContext } from '../core/NetworkGame';
import { InputBuffer } from '../input/InputBuffer';
import { MessageDispatchService } from './MessageDispatchService';

export class RoundService {
  private readonly gameState: GameState;
  private readonly inputBuffer: InputBuffer;
  private readonly messageDispatchService: MessageDispatchService;

  private isRoundEnding = false;

  constructor({ gameState, messageDispatchService, inputBuffer }: NetworkGameContext) {
    this.gameState = gameState;
    this.messageDispatchService = messageDispatchService;
    this.inputBuffer = inputBuffer;
  }

  onRoundStart() {
    this.gameState.beginRound();
    this.isRoundEnding = false;

    for (const player of this.gameState.getAllPlayers()) {
      this.messageDispatchService.sendClientSpecificData(player.getPlayerId(), { isAlive: true });
    }

    this.messageDispatchService.sendLeaderboardUpdate();
  }

  onRoundEnd() {
    if (this.isRoundEnding) return;
    this.isRoundEnding = true;

    const roundSurvivor = this.gameState.getActivePlayers()[0];
    if (roundSurvivor) {
      roundSurvivor.addRoundSurvivalBonus();
    }

    // Check if the game should end.
    if (this.gameState.shouldGameEnd()) {
      this.onGameEnd();
    } else {
      this.messageDispatchService.sendOverlayMessage({
        type: 'round_over',
        message: 'Round Over!',
        player: roundSurvivor?.toPlayerData(),
      });
      setTimeout(() => {
        this.gameState.beginWaiting();

        // Sometimes players can die on the same tick.
        let message = `Round ${this.gameState.getRoundNumber()} over!`;
        if (roundSurvivor) {
          message += ` {playerName} survived round ${this.gameState.getRoundNumber()}!`;
          this.messageDispatchService.sendPlayerMessage(message, roundSurvivor.getPlayerId());
        } else {
          this.messageDispatchService.sendDefaultMessage(message);
        }
      }, 2000);
    }

    this.messageDispatchService.sendLeaderboardUpdate();

    // Handle round cleanup
    this.inputBuffer.clearAll();
    this.gameState.cleanupPlayerObjects();
  }

  onGameEnd() {
    let message = '';
    let overlayMessage: OverlayMessage = { type: 'game_over' };

    const highestScorers = this.gameState.calculateGameWinner();
    if (highestScorers.length === 1) {
      message = `{playerName} wins the game!`;
      overlayMessage.player = highestScorers[0]?.toPlayerData();
      highestScorers[0]?.addGameWin();

      this.messageDispatchService.sendPlayerMessage(message, highestScorers[0]?.getPlayerId() ?? '');
    } else {
      message = 'Tie Game!';
      overlayMessage.message = message;
      this.messageDispatchService.sendDefaultMessage(message);
    }

    // Let the players see the game over message for a few seconds...
    setTimeout(() => {
      this.gameState.resetGame();
    }, 2000);

    this.messageDispatchService.sendOverlayMessage(overlayMessage);
  }
}
