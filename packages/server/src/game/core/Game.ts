import { Collision, GameEvents, getRandomColor, getRandomNumber, Point } from '@battle-snakes/shared';
import { DEFAULT_FOOD_COUNT, MAX_ROOM_SIZE, TICK_RATE_MS } from '../../config/gameConfig';
import { GameLoop } from './GameLoop';
import { GameState } from './GameState';
import { Player } from '../domain/Player';
import { GameEventBus } from '../events/GameEventBus';
import { CollisionService } from '../services/CollisionService';
import { CpuPlayer } from '../domain/CpuPlayer';
import { InputBuffer } from '../input/InputBuffer';

export class Game {
  private roomId: string;
  private gameState: GameState;
  private gameLoop: GameLoop;
  private inputBuffer: InputBuffer;

  constructor(roomId: string, gridSize: number, private readonly gameEventBus: GameEventBus) {
    this.roomId = roomId;
    this.gameState = new GameState(gridSize);
    this.gameLoop = new GameLoop(() => this.update(), TICK_RATE_MS);
    this.gameEventBus = gameEventBus;
    this.inputBuffer = new InputBuffer();

    this.debug_spawnCPU(MAX_ROOM_SIZE / 2);
  }

  public start() {
    this.gameLoop.start();
    this.spawnFood();
  }

  public stop() {
    this.gameLoop.stop();
  }

  // Main update loop.
  private update(): void {
    // Step One: process all inputs.
    this.processInputs();

    // Step Two: update all player positions.
    this.movementTick();

    // Step Three: track all collisions that occurred after position update.
    const collisions = CollisionService.detectCollisions(this.gameState);

    // Step Four: handle collision effects on the game state...
    this.updateGameState(collisions);

    // Step Five: update the visual grid for display, send out the updated map. (This can probably be removed in the future...)
    this.gameState.updateGrid();
    this.gameEventBus.emit(GameEvents.STATE_UPDATE, this.roomId, this.gameState.toSharedGameState());
  }

  public tryToAddPlayerToRoom(playerId: string): boolean {
    if (!this.gameState.hasVacancy()) {
      return false;
    }

    this.spawnPlayer(playerId);
    return true;
  }

  public removePlayerFromRoom(playerId: string) {
    this.gameState.removePlayer(playerId);
    this.inputBuffer.clearPlayer(playerId);
    this.gameEventBus.emit(GameEvents.LEADERBOARD_UPDATE, this.roomId, this.gameState.getPlayerData());
  }

  private spawnPlayer(playerId: string) {
    const player = new Player(playerId, {
      color: getRandomColor(),
      startPosition: this.getRandomAvailablePosition(),
    });

    this.gameState.addPlayer(player);
  }

  public getPlayerData() {
    return this.gameState.getPlayerData();
  }

  // Maybe extract this to random.ts and pass in the game state variable.
  public getRandomAvailablePosition(): Point {
    // const { gridSize, players, foodPositions } = this.gameState;
    const gridSize = this.gameState.getGridSize();
    const foodPositions = this.gameState.getFoodPositions();

    const totalPositions = gridSize * gridSize;
    const activePlayerCells = this.gameState.getActivePlayerCells();
    const occupiedCount = activePlayerCells.size + foodPositions.size;

    // If there are no available positions, return undefined. ( this is rare )
    if (occupiedCount === totalPositions) {
      console.error('Occupied Counts: ', occupiedCount, ' and total:', totalPositions);
    }

    let target = getRandomNumber(0, totalPositions - occupiedCount);

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const pos = new Point(x, y);

        if (!activePlayerCells.has(pos.toString()) && !foodPositions.has(pos.toString())) {
          if (target === 0) return pos;
          target--;
        }
      }
    }

    throw new Error('No available positions.');
  }

  private movementTick() {
    const players = this.gameState.getActivePlayers();

    for (const player of players.values()) {
      if (player instanceof CpuPlayer) {
        player.chooseNextMove();
        player.updateGameState(this.gameState);
      }

      player.move();
    }
  }

  public getInputBuffer(): InputBuffer {
    return this.inputBuffer;
  }

  // Grab the inputs for the current tick, update the player's direction based off the buffer.
  private processInputs() {
    const inputs = this.inputBuffer.processInputsForTick();

    for (const input of inputs) {
      const player = this.gameState.getPlayer(input.playerId);
      if (!player || !player.isActive()) continue;

      // Input validation is done in the player class.
      player.setDirection(input.direction);
    }
  }

  public spawnFood() {
    while (this.gameState.getFoodPositions().size < DEFAULT_FOOD_COUNT) {
      const foodPoint = this.getRandomAvailablePosition();

      this.gameState.addFood(foodPoint);
    }
  }

  private updateGameState(collisions: Collision[]) {
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

    if (collisions.length > 0) {
      this.gameEventBus.emit(GameEvents.COLLISION_EVENT, this.roomId, collisions);
    }

    if (wasScoreUpdated) {
      this.spawnFood();
      this.gameEventBus.emit(GameEvents.LEADERBOARD_UPDATE, this.roomId, this.gameState.getPlayerData());
    }
  }

  // I want to move this eventually...
  debug_spawnCPU(num: number) {
    for (let i = 0; i < num; i++) {
      const id = `ai [${crypto.randomUUID().split('-')[0]}]`;
      this.gameState.addPlayer(new CpuPlayer(id, { startPosition: this.getRandomAvailablePosition(), color: getRandomColor() }));
    }
  }
}
