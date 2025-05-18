import { Game, GameState, SpawnService } from '@battle-snakes/shared';
import { LeaderboardService } from './service/LeaderboardService';
import { GameConfigOptions } from '../GameRunner';
import { ClientGameState } from '@/state/ClientGameState';
import { LeaderboardObservable } from '@/state/LeaderboardObservable';

export interface LocalGameContext {
  gameConfigOptions: GameConfigOptions;
  gameState: GameState;
  spawnService: SpawnService;
}
export class LocalGame extends Game {
  private leaderboardService: LeaderboardService;

  constructor(gridSize: number, gameConfigOptions: GameConfigOptions) {
    super(gridSize);

    const context: LocalGameContext = {
      gameConfigOptions,
      gameState: this.gameState,
      spawnService: this.spawnService,
    };

    this.leaderboardService = new LeaderboardService(context);
  }

  start() {}

  tick(deltaTime: number) {



    // At the end of each tick, send the latest game state to each component that expects something.
    ClientGameState.getInstance().publish(this.gameState.toSharedGameState());
    LeaderboardObservable.getInstance().publish(this.gameState.getPlayerData());
  }

  stop() {}
}
