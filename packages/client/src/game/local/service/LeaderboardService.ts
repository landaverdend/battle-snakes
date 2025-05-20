import { GameState, OverlayMessage } from '@battle-snakes/shared';
import { LocalGameContext } from '../LocalGame';
import { publishOverlayMessage } from '@/service/OverlayMessageEventBus';

export class LeaderboardService {
  private gameStateRef: GameState;

  constructor({ gameState }: LocalGameContext) {
    this.gameStateRef = gameState;
  }

  broadcastGameOverMessage() {
    let message = '';
    let overlayMessage: OverlayMessage = { type: 'game_over' };

    const highestScorers = this.gameStateRef.calculateGameWinner();
    if (highestScorers.length === 1) {
      message = `{playerName} wins the game!`;
      overlayMessage.player = highestScorers[0]?.toPlayerData();
      highestScorers[0]?.addGameWin();
    } else {
      message = 'Tie Game!';
      overlayMessage.message = message;
    }
    publishOverlayMessage(overlayMessage);
  }

  broadcastRoundOverMessage() {
    const survivor = this.gameStateRef.getActivePlayers()[0];

    if (survivor) {
      survivor.addRoundSurvivalBonus();
    }

    publishOverlayMessage({ type: 'round_over', message: 'Round Over!', player: survivor?.toPlayerData() });
  }
}
