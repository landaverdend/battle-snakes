import { Game, GameState, RoundState, SpawnService } from '@battle-snakes/shared';
import { LeaderboardService } from './service/LeaderboardService';
import { GameConfigOptions } from '../GameRunner';
import { ClientGameState } from '@/state/ClientGameState';
import { LeaderboardObservable } from '@/state/LeaderboardObservable';
import { ActiveGameStrategy } from './service/ActiveGameStrategy';
import { WaitingGameStrategy } from './service/WaitingGameStrategy';

export interface LocalGameContext {
  gameConfigOptions: GameConfigOptions;
  gameState: GameState;
  spawnService: SpawnService;
}
export class LocalGame extends Game {
  private leaderboardService: LeaderboardService;

  private activeGameStrategy: ActiveGameStrategy;
  private waitingGameStrategy: WaitingGameStrategy;

  constructor(gridSize: number, gameConfigOptions: GameConfigOptions) {
    super(gridSize);

    const context: LocalGameContext = {
      gameConfigOptions,
      gameState: this.gameState,
      spawnService: this.spawnService,
    };

    this.leaderboardService = new LeaderboardService(context);

    this.activeGameStrategy = new ActiveGameStrategy(context);
    this.waitingGameStrategy = new WaitingGameStrategy(context);
  }

  start() {
    this.gameState.beginWaiting();
  }

  tick(deltaTime: number) {
    switch (this.gameState.getRoundState()) {
      case RoundState.WAITING:
        this.waitingGameStrategy.tick(deltaTime);
        break;
      case RoundState.ACTIVE:
        this.activeGameStrategy.tick(deltaTime);
        break;
    }
    // At the end of each tick, send the latest game state to each component that expects something.
    ClientGameState.getInstance().publish(this.gameState.toSharedGameState());
    LeaderboardObservable.getInstance().publish(this.gameState.getPlayerData());
  }

  stop() {}
}
