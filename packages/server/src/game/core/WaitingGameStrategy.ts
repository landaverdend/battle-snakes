import { COUNTDOWN_TIME, GameState, SpawnService } from '@battle-snakes/shared';
import { NetworkGameContext } from './NetworkGame';
import { RoundService } from '../services/RoundService';
import { MessageDispatchService } from '../services/MessageDispatchService';

export class WaitingGameStrategy {
  private gameState: GameState;
  private roundService: RoundService;
  private messageDispatchService: MessageDispatchService;
  private spawnService: SpawnService;

  private haveEntitiesBeenSpawned = false;

  private countdownIntervalRef: NodeJS.Timeout | null = null;
  private countdownValue: number | null = null;

  constructor({ gameState, messageDispatchService }: NetworkGameContext, roundService: RoundService, spawnService: SpawnService) {
    this.gameState = gameState;
    this.messageDispatchService = messageDispatchService;
    this.roundService = roundService;
    this.spawnService = spawnService;
  }

  tick(deltaTime: number) {
    // Spawn initial entities if they aren't there yet.
    if (!this.haveEntitiesBeenSpawned) {
      this.spawnService.spawnInitialFood();
      this.spawnService.spawnAllPlayers();
      this.haveEntitiesBeenSpawned = true;

      if (this.gameState.getAllPlayers().length === 1) {
        this.messageDispatchService.sendDefaultMessage('Waiting for players to join...');
        this.messageDispatchService.sendOverlayMessage({ type: 'waiting', message: 'Waiting for players to join...' });
      }

      // This is bad.
      this.gameState.getAllPlayers().forEach((p) =>
        this.messageDispatchService.sendClientSpecificData(p.getPlayerId(), {
          isAlive: false,
          spawnPoint: p.getHead(),
        })
      );
    }

    // Switch to intermission countdown if there is more than one player.
    if (!this.countdownIntervalRef && this.gameState.getAllPlayers().length > 1) {
      this.beginCountdown();
    }

    this.gameState.updateGrid(); // We want to show the players spawn positions before the game starts.
    this.messageDispatchService.sendGameStateUpdate();
  }

  // Special case for when we go back to one player.
  public handlePlayerRemoval() {
    if (this.gameState.getAllPlayers().length === 1) {
      this.clearCountdown();
      this.messageDispatchService.sendOverlayMessage({ type: 'waiting', message: 'Waiting for players to join...' });
    }
  }

  private beginCountdown() {
    this.countdownValue = COUNTDOWN_TIME;
    this.messageDispatchService.sendOverlayMessage({ type: 'countdown', message: String(this.countdownValue) });

    this.countdownIntervalRef = setInterval(() => {
      if (this.countdownValue === null) {
        return;
      }

      this.countdownValue--;
      if (this.countdownValue > 0) {
        this.messageDispatchService.sendOverlayMessage({ type: 'countdown', message: String(this.countdownValue) });
      } else {
        this.clearCountdown();
        this.haveEntitiesBeenSpawned = false;
        this.roundService.onRoundStart();
        this.messageDispatchService.sendOverlayMessage({ type: 'clear' });
      }
    }, 1000);
  }

  private clearCountdown() {
    if (this.countdownIntervalRef) {
      clearInterval(this.countdownIntervalRef);
      this.countdownIntervalRef = null;
      this.countdownValue = null;
    }
  }
}
