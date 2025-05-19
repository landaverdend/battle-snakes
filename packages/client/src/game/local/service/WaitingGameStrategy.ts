import { COUNTDOWN_TIME, CountdownTimer, GameState, Point, SpawnService } from '@battle-snakes/shared';
import { LocalGameContext } from '../LocalGame';
import { publishOverlayMessage } from '@/service/OverlayMessageEventBus';
import { publishClientSpecificData } from '@/state/ClientPlayerObservable';

export class WaitingGameStrategy {
  private localPlayerId: string;

  private gameState: GameState;
  private spawnService: SpawnService;

  private countdownTimer: CountdownTimer;

  private haveEntitiesBeenSpawned = false;

  constructor({ gameState, spawnService, gameConfigOptions }: LocalGameContext) {
    this.gameState = gameState;
    this.spawnService = spawnService;
    this.localPlayerId = gameConfigOptions.playerName;

    this.countdownTimer = new CountdownTimer(
      COUNTDOWN_TIME,
      // publish countdown message on tick.
      (val) => {
        publishOverlayMessage({ type: 'countdown', message: String(val) });
      },
      // when the countdown is done, begin the round
      () => {
        this.gameState.beginRound();
        publishOverlayMessage({ type: 'clear' });
        this.haveEntitiesBeenSpawned = false;
      }
    );
  }

  tick(deltaTime: number) {
    if (!this.haveEntitiesBeenSpawned && !this.countdownTimer.isRunning()) {
      this.spawnService.spawnInitialFood();
      this.spawnService.spawnAllPlayers();
      this.haveEntitiesBeenSpawned = true;

      publishOverlayMessage({ type: 'waiting', message: '...' });
      publishClientSpecificData({ isAlive: false, spawnPoint: this.gameState.getPlayer(this.localPlayerId)?.getHead() as Point });
    }

    if (!this.countdownTimer.isRunning()) {
      this.countdownTimer.start();
    }

    

    this.gameState.updateGrid();
  }
}
