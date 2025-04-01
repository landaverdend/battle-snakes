import { Collision, getRandomColor, getRandomNumber, Point, SharedGameState } from '@battle-snakes/shared';
import { DEFAULT_GRID_SIZE } from '../config/gameConfig';
import { GameState } from './GameState';
import { Player } from './Player';
import { CollisionManager } from './CollisionManager';

export class GameLogic {
  private gameState: GameState;
  private collisionManager: CollisionManager;
  

  public constructor() {
    this.gameState = new GameState(DEFAULT_GRID_SIZE);
    this.collisionManager = new CollisionManager();
  }

  public tick() {
    // 1) Move players.
    this.movementTick();

    // 2) Check for collisions using player positions.
    const collisions = this.collisionManager.detectCollisions(this.gameState);

    // 3) Handle collision effects
    this.handleCollisions(collisions);

    // 4) Update the grid with the final state (only alive players.)
    this.gameState.update();
  }

  public spawnPlayer(playerId: string) {
    const player = new Player(playerId, {
      color: getRandomColor(),
      startPosition: this.getRandomAvailablePosition(),
    });

    this.gameState.addPlayer(player);
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
      player.move();
    }
  }

  private handleCollisions(collisions: Collision[]) {
    for (const collision of collisions) {
      switch (collision.type) {
        case 'snake':
        case 'wall':
          if (collision.playerId) this.gameState.killPlayer(collision.playerId);
          break;
      }
    }
  }

  public getRandomAvailablePosition(): Point {
    const { gridSize, grid } = this.gameState;

    const totalPositions = gridSize * gridSize;
    const occupiedCount = grid.size;

    // If there are no available positions, return undefined. ( this is rare )
    if (occupiedCount === totalPositions) throw new Error('No available positions');

    let target = getRandomNumber(0, totalPositions - occupiedCount);

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const pos = new Point(x, y);

        if (!grid.has(pos.toString())) {
          if (target === 0) return pos;
          target--;
        }
      }
    }

    throw new Error('No available positions.');
  }
}
