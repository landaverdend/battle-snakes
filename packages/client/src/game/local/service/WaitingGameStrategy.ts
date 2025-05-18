import { COUNTDOWN_TIME, CountdownTimer, GameState, SpawnService } from '@battle-snakes/shared';
import { LocalGameContext } from '../LocalGame';
import { OverlayMessageEventBus } from '@/service/OverlayMessageEventBus';

export class WaitingGameStrategy {
  private gameState: GameState;
  private spawnService: SpawnService;

  private countdownTimer: CountdownTimer;

  private haveEntitiesBeenSpawned = false;

  constructor({ gameState, spawnService }: LocalGameContext) {
    this.gameState = gameState;
    this.spawnService = spawnService;

    this.countdownTimer = new CountdownTimer(
      COUNTDOWN_TIME,
      // publish countdown message on tick.
      (val) => {
        OverlayMessageEventBus.getInstance().publish({ type: 'countdown', message: String(val) });
      },
      // when the countdown is done, begin the round
      () => {
        this.gameState.beginRound();
        OverlayMessageEventBus.getInstance().publish({ type: 'clear' });
      }
    );
  }

  tick(deltaTime: number) {
    if (!this.haveEntitiesBeenSpawned) {
      this.spawnService.spawnInitialFood();
      this.spawnService.spawnAllPlayers();
      this.haveEntitiesBeenSpawned = true;
      OverlayMessageEventBus.getInstance().publish({ type: 'waiting', message: '...' });
    }

    if (!this.countdownTimer.isRunning()) {
      this.countdownTimer.start();
    }

    this.gameState.updateGrid();
  }
}
