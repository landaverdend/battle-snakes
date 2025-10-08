import {
  Collision,
  CollisionService,
  CountdownTimer,
  CpuPlayer,
  DEFAULT_FOOD_COUNT,
  GameLoop,
  GameState,
  SpawnService,
} from '@battle-snakes/shared';
import { LocalGameContext } from '../LocalGame';
import { LocalInputHandler } from './LocalInputHandler';
import { publishOverlayMessage } from '@/service/OverlayMessageEventBus';
import { LeaderboardService } from './LeaderboardService';
import { publishMessage } from '@/state/MessageFeedObservable';

export class ActiveGameStrategy {
  private localPlayerId;

  private gameState: GameState;

  private inputHandler: LocalInputHandler;
  private roundIntermissionTimer: CountdownTimer;
  private gameOverTimer: CountdownTimer;

  private spawnService: SpawnService;
  private leaderboardService: LeaderboardService;

  private movementAccumulator = 0;

  constructor(
    { gameState, spawnService, gameConfigOptions, inputHandler }: LocalGameContext,
    leaderboardService: LeaderboardService
  ) {
    this.localPlayerId = gameConfigOptions.playerName;

    this.gameState = gameState;
    this.spawnService = spawnService;
    this.leaderboardService = leaderboardService;

    this.inputHandler = inputHandler;
    this.roundIntermissionTimer = new CountdownTimer(
      2,
      () => {},
      () => {
        this.gameState.beginWaiting();
      }
    );

    this.gameOverTimer = new CountdownTimer(
      4,
      () => {},
      () => {
        this.gameState.resetGame();
      }
    );
  }

  tick(deltaTime: number) {
    // requestAnimationFrame() is fast af. we only want to update game state after a certain amount of time has accumulated...
    // The speed of each snake is tied to the update interval.
    this.movementAccumulator += deltaTime;
    if (this.movementAccumulator < GameLoop.GAME_STATE_UPDATE_INTERVAL_MS) {
      return;
    } else {
      this.movementAccumulator -= GameLoop.GAME_STATE_UPDATE_INTERVAL_MS;
    }

    // Step One: process input
    this.handleInput();

    // Step Two: update player positions
    this.movementTick();

    // Step Three: detect collisions
    const collisions = CollisionService.detectCollisions(this.gameState);

    // Step Four: handle collision effects
    this.processCollisions(collisions);
    publishMessage(CollisionService.convertCollisionsToMessages(collisions));

    // Step Five: Resolve the grid state.
    this.gameState.updateGrid();

    if (this.gameState.getFoodPositions().size < DEFAULT_FOOD_COUNT) {
      this.spawnService.spawnFood();
    }

    if (this.gameState.shouldGameEnd() && !this.gameOverTimer.isRunning()) {
      publishOverlayMessage({ type: 'game_over' });
      this.leaderboardService.broadcastGameOverMessage();
      this.gameOverTimer.start();
    } else if (!this.gameOverTimer.isRunning() && this.gameState.shouldRoundEnd() && !this.roundIntermissionTimer.isRunning()) {
      publishOverlayMessage({ type: 'round_over', message: 'Round Over!' });
      this.leaderboardService.broadcastRoundOverMessage();
      this.roundIntermissionTimer.start();
    }
  }

  private movementTick() {
    const players = this.gameState.getActivePlayers();

    for (const player of players.values()) {
      player.move();

      if (player instanceof CpuPlayer) {
        player.chooseNextMove(this.gameState);
      }
    }
  }

  private processCollisions(collisions: Collision[]) {
    let wasScoreUpdated = false;

    for (const collision of collisions) {
      switch (collision.type) {
        case 'self':
        case 'snake':
        case 'wall':
          this.gameState.killPlayer(collision.playerId);
          break;
        case 'food':
          this.gameState.removeFood(collision.point);
          this.gameState.growPlayer(collision.playerId);
          wasScoreUpdated = true;
          break;
      }
    }

    if (wasScoreUpdated) {
    }
  }

  private handleInput() {
    const input = this.inputHandler.getNextInput();

    if (input) {
      this.gameState.getPlayer(this.localPlayerId)?.setDirection(input);
    }
  }
}
