import { COUNTDOWN_TIME, CountdownTimer, GameState, SpawnService } from '@battle-snakes/shared';
import { NetworkGameContext } from './NetworkGame';
import { RoundService } from '../services/RoundService';
import { MessageDispatchService } from '../services/MessageDispatchService';

export class WaitingGameStrategy {
  private gameState: GameState;
  private roundService: RoundService;
  private messageDispatchService: MessageDispatchService;
  private spawnService: SpawnService;

  private countdownTimer: CountdownTimer;
  private haveEntitiesBeenSpawned = false;

  constructor({ gameState, messageDispatchService }: NetworkGameContext, roundService: RoundService, spawnService: SpawnService) {
    this.gameState = gameState;
    this.messageDispatchService = messageDispatchService;
    this.roundService = roundService;
    this.spawnService = spawnService;

    this.countdownTimer = new CountdownTimer(
      COUNTDOWN_TIME,
      (val) => {
        this.messageDispatchService.sendOverlayMessage({ type: 'countdown', message: String(val) });
      },
      () => {
        this.haveEntitiesBeenSpawned = false;
        this.roundService.onRoundStart();
        this.messageDispatchService.sendOverlayMessage({ type: 'clear' });
      }
    );
  }

  tick() {
    // Spawn initial entities if they aren't there yet.
    if (!this.haveEntitiesBeenSpawned) {
      this.spawnService.spawnInitialFood();
      this.spawnService.spawnAllPlayers();
      this.haveEntitiesBeenSpawned = true;

      if (this.gameState.getAllPlayers().length === 1) {
        this.messageDispatchService.broadcastWaitingMessage();
      }

      // This is bad.
      this.gameState.getAllPlayers().forEach((p) =>
        this.messageDispatchService.sendClientSpecificData(p.getPlayerId(), {
          isAlive: false,
          spawnPoint: p.getHead(),
        })
      );
    }

    if (!this.countdownTimer.isRunning() && this.gameState.getAllPlayers().length > 1) {
      this.countdownTimer.start();
    }

    if (this.countdownTimer.isRunning() && this.gameState.getAllPlayers().length <= 1) {
      this.messageDispatchService.broadcastWaitingMessage();
      this.countdownTimer.clear();
    }

    this.gameState.updateGrid(); // We want to show the players spawn positions before the game starts.
    this.messageDispatchService.sendGameStateUpdate();
  }

  // Special case for when we go back to one player.
  public handlePlayerRemoval() {
    if (this.gameState.getAllPlayers().length === 1) {
      this.countdownTimer.clear();
      this.messageDispatchService.sendOverlayMessage({ type: 'waiting', message: 'Waiting for players to join...' });
    }
  }
}
