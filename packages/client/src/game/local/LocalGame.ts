import { Direction, Game, GameState, getRandomColor, MAX_ROOM_SIZE, RoundState, SpawnService } from '@battle-snakes/shared';
import { LeaderboardService } from './service/LeaderboardService';
import { GameConfigOptions } from '../GameRunner';
import { ClientGameState } from '@/state/ClientGameState';
import { LeaderboardObservable } from '@/state/LeaderboardObservable';
import { ActiveGameStrategy } from './service/ActiveGameStrategy';
import { WaitingGameStrategy } from './service/WaitingGameStrategy';
import { LocalInputHandler } from './service/LocalInputHandler';

export interface LocalGameContext {
  gameConfigOptions: GameConfigOptions;
  gameState: GameState;
  spawnService: SpawnService;
  inputHandler: LocalInputHandler;
}

export class LocalGame extends Game {
  private leaderboardService: LeaderboardService;

  private activeGameStrategy: ActiveGameStrategy;
  private waitingGameStrategy: WaitingGameStrategy;

  public inputHandler: LocalInputHandler;

  constructor(gridSize: number, gameConfigOptions: GameConfigOptions) {
    super(gridSize);

    this.inputHandler = new LocalInputHandler(this.gameState);

    const context: LocalGameContext = {
      gameConfigOptions,
      gameState: this.gameState,
      spawnService: this.spawnService,
      inputHandler: this.inputHandler,
    };

    this.leaderboardService = new LeaderboardService(context);
    this.activeGameStrategy = new ActiveGameStrategy(context, this.leaderboardService);
    this.waitingGameStrategy = new WaitingGameStrategy(context);

    this.fillPlayers(gameConfigOptions.playerName, gameConfigOptions.playerColor);
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
    LeaderboardObservable.getInstance().publish(this.gameState.getPlayerData().sort((a, b) => b.score - a.score));
  }

  stop() {}

  private fillPlayers(playerName: string, playerColor: string) {
    this.gameState.addPlayer(playerName, playerName, playerColor);

    for (let i = 0; i < MAX_ROOM_SIZE - 1; i++) {
      const name = `CPU ${i + 1}`;
      const color = getRandomColor();

      this.gameState.addCpuPlayer(crypto.randomUUID(), name, color);
    }
  }

  handleInput(dir: Direction): void {
    this.inputHandler.handleInput(dir);
  }
}
