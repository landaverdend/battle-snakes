import { CellType, GridCell, GridState, Point, getRandomNumber, getRandomPosition } from '@battle-snakes/shared';
import { Player } from './Player';
import { DEFAULT_FOOD_COUNT } from '../config/gameConfig';
import { CollisionType } from './GameManager';

export default class GameState {
  private gridState: GridState;
  private players: Map<string, Player>;
  private foodPositions: Point[];
  private occupiedCells: Map<string, GridCell> = new Map();

  constructor(width: number, height: number) {
    this.gridState = {
      width: width,
      height: height,
    };

    this.players = new Map();
    this.foodPositions = [];
  }

  // Update the player positions based off of their respective directions.
  updatePositions() {
    for (const [_, player] of this.players) {
      if (player.isDead()) continue;
      player.move();
    }
  }

  updateOccupiedCells() {
    this.occupiedCells.clear();

    // Add snake segments
    for (const player of this.players.values()) {
      if (player.isDead()) continue;

      for (const segment of player.segments) {
        this.occupiedCells.set(segment.toString(), {
          type: CellType.Snake,
          color: player.color,
          playerId: player.getId(),
        });
      }
    }

    // Add all food - O(f) where f is food count
    for (const food of this.foodPositions) {
      this.occupiedCells.set(food.toString(), { type: CellType.Food });
    }
  }

  // Iterate through all players and check for collisions, handle state updates and return events to broadcast.
  public trackAndHandleCollisions(): CollisionType[] {
    const collisions: CollisionType[] = [];

    for (const player of this.players.values()) {
      if (player.isDead()) continue;

      const collision = player.checkCollision(this.gridState, this.occupiedCells);
      if (collision) {
        // Handle collision effects
        switch (collision.type) {
          case 'death':
            player.setDead();
            break;
          case 'food':
            player.grow(5);
            this.foodPositions = this.foodPositions.filter((food) => !food.equals(player.segments[0] as Point));
            break;
        }
        collisions.push(collision);
      }
    }

    return collisions;
  }

  public placeFood() {
    if (this.foodPositions.length >= DEFAULT_FOOD_COUNT) return;

    const position = this.getAvailablePosition();

    if (position) {
      this.foodPositions.push(position);
      this.occupiedCells.set(position.toString(), { type: CellType.Food });
    }
  }

  public isSpaceOccupied(position: Point): boolean {
    return this.occupiedCells.has(position.toString());
  }

  public getPlayers(): Map<String, Player> {
    return this.players;
  }

  public addPlayer(socketId: string) {
    const { width, height } = this.gridState;
    this.players.set(socketId, new Player(socketId, { startPosition: getRandomPosition(width, height) }));
  }

  public removePlayer(socketId: string) {
    this.players.delete(socketId);
  }

  /**
   * Serialize the game state into a client-friendly format.
   * @returns
   */
  public serialize() {
    return {
      gridState: this.gridState,
      players: Object.fromEntries(this.players.entries()),
      occupiedCells: Object.fromEntries(this.occupiedCells.entries()),
    };
  }

  private getAvailablePosition(): Point | undefined {
    const { width, height } = this.gridState;
    const totalPositions = width * height;
    const occupiedCount = this.occupiedCells.size;

    // If there are no available positions, return undefined. ( this is rare )
    if (occupiedCount === totalPositions) return undefined;

    let target = getRandomNumber(0, totalPositions - occupiedCount);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const pos = new Point(x, y);

        if (!this.occupiedCells.has(pos.toString())) {
          if (target === 0) return pos;
          target--;
        }
      }
    }
  }
}
