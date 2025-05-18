import { GameEvents, GameMessage, GameState, OverlayMessage } from '@battle-snakes/shared';
import { GameEventBus } from '../events/GameEventBus';
import { NetworkGameContext } from '../core/NetworkGame';
import { InputBuffer } from '../input/InputBuffer';

export class RoundService {
  private readonly gameState: GameState;
  private readonly gameEventBus: GameEventBus;
  private readonly roomId: string;
  private readonly inputBuffer: InputBuffer;

  private isRoundEnding = false;

  constructor({ roomId, gameState, gameEventBus, inputBuffer }: NetworkGameContext) {
    this.roomId = roomId;
    this.gameState = gameState;
    this.gameEventBus = gameEventBus;
    this.inputBuffer = inputBuffer;
  }

  onRoundStart() {
    this.gameState.beginRound();
    this.isRoundEnding = false;

    for (const player of this.gameState.getAllPlayers()) {
      this.gameEventBus.emit(GameEvents.CLIENT_SPECIFIC_DATA, player.getPlayerId(), {
        isAlive: true,
      });
    }

    this.sendLeaderboardUpdate();
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
      this.sendOverlayMessage({ type: 'round_over', message: 'Round Over!', player: roundSurvivor?.toPlayerData() });
      setTimeout(() => {
        this.gameState.beginWaiting();

        // Sometimes players can die on the same tick.
        let message = `Round ${this.gameState.getRoundNumber()} over!`;
        if (roundSurvivor) {
          message += ` {playerName} survived round ${this.gameState.getRoundNumber()}!`;
          this.sendPlayerMessage(message, roundSurvivor.getPlayerId());
        } else {
          this.sendDefaultMessage(message);
        }
      }, 2000);
    }

    this.sendLeaderboardUpdate();

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

      this.sendPlayerMessage(message, highestScorers[0]?.getPlayerId() ?? '');
    } else {
      message = 'Tie Game!';
      overlayMessage.message = message;
      this.sendDefaultMessage(message);
    }

    // Let the players see the game over message for a few seconds...
    setTimeout(() => {
      this.gameState.resetGame();
    }, 2000);

    this.sendOverlayMessage(overlayMessage);
  }

  private sendDefaultMessage(message: string, type: GameMessage['type'] = 'default') {
    this.gameEventBus.emit(GameEvents.MESSAGE_EVENT, this.roomId, [{ type, message }]);
  }

  private sendPlayerMessage(message: string, playerId: string) {
    this.gameEventBus.emit(GameEvents.MESSAGE_EVENT, this.roomId, [
      { type: 'player', message: message, playerData: this.gameState.getPlayerDataById(playerId) },
    ]);
  }

  private sendLeaderboardUpdate() {
    this.gameEventBus.emit(
      GameEvents.LEADERBOARD_UPDATE,
      this.roomId,
      this.gameState.getPlayerData().sort((a, b) => b.score - a.score)
    );
  }

  private sendOverlayMessage(overlayMessage: OverlayMessage) {
    this.gameEventBus.emit(GameEvents.OVERLAY_MESSAGE, this.roomId, overlayMessage);
  }
}
