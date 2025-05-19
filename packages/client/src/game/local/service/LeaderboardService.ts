import { GameState } from '@battle-snakes/shared';
import { LocalGameContext } from '../LocalGame';

export class LeaderboardService {
  private gameStateRef: GameState;

  constructor({ gameState, gameConfigOptions }: LocalGameContext) {
    this.gameStateRef = gameState;
  }
}
