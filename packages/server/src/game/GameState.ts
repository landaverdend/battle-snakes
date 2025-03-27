import { CellType, GameAction, GridCell, GridState, Point, getRandomPosition } from '@battle-snakes/shared';
import { Player } from './Player';
import { DEFAULT_FOOD_COUNT } from '../config/gameConfig';

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

  public checkCollisions() {
    let collisions: GameAction[] = [];

    for (const [playerId, player] of this.players) {
      if (player.isDead()) continue;

      const head = player.segments[0] as Point;
      const headKey = head.toString();
      const cellAtHead = this.occupiedCells.get(headKey);

      if (player.isOutOfBounds(this.gridState) || cellAtHead?.type === CellType.Snake) {
        player.setIsAlive(false);

        if (cellAtHead?.type === CellType.Snake) {
          collisions.push({ type: 'death', playerId, targetId: cellAtHead.playerId });
        } else {
          collisions.push({ type: 'death', playerId });
        }
        continue;
      }

      // Food collision
      if (cellAtHead?.type === CellType.Food) {
        player.grow(5);
        this.foodPositions = this.foodPositions.filter((food) => food.toString() !== headKey);
      }
    }

    return collisions;
  }

  public placeFood() {
    if (this.foodPositions.length >= DEFAULT_FOOD_COUNT) return;

    while (this.foodPositions.length < DEFAULT_FOOD_COUNT) {
      const newFoodPosition = getRandomPosition(this.gridState.width, this.gridState.height);
      const positionKey = newFoodPosition.toString();

      // Check if position is already occupied using O(1) lookup
      if (!this.isSpaceOccupied(newFoodPosition)) {
        this.foodPositions.push(newFoodPosition);
        this.occupiedCells.set(positionKey, { type: CellType.Food });
      }
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
}
