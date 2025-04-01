import { Collision, getRandomColor, getRandomNumber, Point, SharedGameState } from '@battle-snakes/shared';
import { DEFAULT_FOOD_COUNT, DEFAULT_GRID_SIZE } from '../config/gameConfig';
import { GameState } from './GameState';
import { Player } from './Player';
import { CollisionManager } from './CollisionManager';
import { CpuPlayer } from './CpuPlayer';

export class GameLogic {
  private gameState: GameState;
  private collisionManager: CollisionManager;

  public constructor() {
    this.gameState = new GameState(DEFAULT_GRID_SIZE);
    this.collisionManager = new CollisionManager();

    this.spawnFood();
    this.debug_spawnCPU(20);
  }

  public tick() {
    // 1) Move players.
    this.movementTick();

    // 2) Check for collisions using player positions.
    const collisions = this.collisionManager.detectCollisions(this.gameState);

    // 3) Handle collision effects
    this.handleCollisions(collisions);

    // 4) Update the grid with the final state (only alive players.)
    this.gameState.updateClientGrid();
  }

  public spawnPlayer(playerId: string) {
    const player = new Player(playerId, {
      color: getRandomColor(),
      startPosition: this.getRandomAvailablePosition(),
    });

    this.gameState.addPlayer(player);
  }

  public spawnFood() {
    while (this.gameState.foodPositions.size < DEFAULT_FOOD_COUNT) {
      const foodPoint = this.getRandomAvailablePosition();

      this.gameState.addFood(foodPoint);
    }
  }

  public removePlayer(playerId: string) {
    this.gameState.removePlayer(playerId);
  }

  public getSharedGameState(): SharedGameState {
    return this.gameState.getSharedGameState();
  }

  public movementTick() {
    const players = this.gameState.getPlayers();

    for (const player of players.values()) {
      if (player instanceof CpuPlayer) {
        player.chooseNextMove();
        player.updateGameState(this.gameState);
      }

      player.move();
    }
  }

  private handleCollisions(collisions: Collision[]) {
    for (const collision of collisions) {
      switch (collision.type) {
        case 'self':
        case 'snake':
        case 'wall':
          this.gameState.killPlayer(collision.playerId);
          break;
        case 'food':
          this.gameState.removeFood(this.gameState.players.get(collision.playerId)?.getHead()!!);
          this.gameState.growPlayer(collision.playerId);
          break;
      }
    }

    this.spawnFood();
  }

  public getRandomAvailablePosition(): Point {
    const { gridSize, players, foodPositions } = this.gameState;

    const totalPositions = gridSize * gridSize;
    const activePlayerCells = this.collisionManager.collectActivePlayerCells(players);
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

  debug_spawnCPU(num: number) {
    for (let i = 0; i < num; i++) {
      const id = `ai [${crypto.randomUUID().split('-')[0]}]`;
      this.gameState.addPlayer(new CpuPlayer(id, { startPosition: this.getRandomAvailablePosition(), color: getRandomColor() }));
    }
  }
}
