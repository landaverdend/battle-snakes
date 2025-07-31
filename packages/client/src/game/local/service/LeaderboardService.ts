import { GameState, OverlayMessage } from '@battle-snakes/shared';
import { LocalGameContext } from '../LocalGame';
import { publishOverlayMessage } from '@/service/OverlayMessageEventBus';
import { publishMessage } from '@/state/MessageFeedObservable';

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
      publishMessage({ type: 'player', message: message, playerData: highestScorers[0]?.toPlayerData() });
    } else {
      message = 'Tie Game!';
      overlayMessage.message = message;
      publishMessage({ type: 'default', message });
    }
    publishOverlayMessage(overlayMessage);
  }

  broadcastRoundOverMessage() {
    const survivor = this.gameStateRef.getActivePlayers()[0];
    let message = 'Round Over!';

    if (survivor) {
      survivor.addRoundSurvivalBonus();
      message += ` {playerName} survived round ${this.gameStateRef.getRoundNumber()}!`;
    }

    publishMessage({ type: 'player', message: message, playerData: survivor?.toPlayerData() });
    publishOverlayMessage({ type: 'round_over', message: 'Round Over!', player: survivor?.toPlayerData() });
  }
}
