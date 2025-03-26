import { GameAction, GridState, Point, getRandomPosition } from '@battle-snakes/shared';
import { Player } from './Player';
import { DEFAULT_FOOD_COUNT } from '../config/gameConfig';

export default class GameState {
  private gridState: GridState;
  private players: Map<string, Player>;
  private foodPositions: Point[];

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
      this.movePlayer(player);
    }
  }

  movePlayer(player: Player) {
    const head = player.segments[0] as Point;
    const newHead = new Point(head.x, head.y);

    switch (player.direction) {
      case 'up':
        newHead.y--;
        break;
      case 'down':
        newHead.y++;
        break;
      case 'left':
        newHead.x--;
        break;
      case 'right':
        newHead.x++;
        break;
    }

    player.segments.unshift(newHead);
    player.segments.pop();
  }

  public checkCollisions() {
    let collisions: GameAction[] = [];

    for (const [playerId, player] of this.players) {
      if (player.isDead()) continue;

      if (player.checkDeathCollision(this.gridState, this.players)) {
        player.setIsAlive(false);
        collisions.push({ type: 'death', playerId: playerId });
        continue; // skip the rest of the checks if the player is dead
      }

      // When player collides with food, the following happens:
      // 1. the player grows
      // 2. food is removed from the game state. (it will be placed again in the next tick)
      // 3. the player's score is incremented.
      if (player.checkFoodCollision(this.foodPositions)) {
        player.grow();
        this.foodPositions = this.foodPositions.filter((foodPos) => !foodPos.equals(player.segments[0] as Point));
      }
    }

    return collisions;
  }

  /**
   * TODO:
   */
  public placeFood() {
    if (this.foodPositions.length >= DEFAULT_FOOD_COUNT) return;

    let newFoodPosition = getRandomPosition(this.gridState.width, this.gridState.height);

    while (this.foodPositions.length < DEFAULT_FOOD_COUNT && !this.isSpaceOccupied(newFoodPosition)) {
      this.foodPositions.push(newFoodPosition);
      newFoodPosition = getRandomPosition(this.gridState.width, this.gridState.height);
    }
  }

  // Run through and check if a space is occupied by:
  // 1) A player
  // 2) Food
  // 3) Future items?
  private isSpaceOccupied(position: Point): boolean {
    for (const player of this.players.values()) {
      for (const segment of player.segments) {
        if (segment.equals(position)) {
          return true;
        }
      }
    }

    for (const foodPosition of this.foodPositions) {
      if (foodPosition.equals(position)) {
        return true;
      }
    }

    // TODO: check for future items.

    return false;
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
      foodPositions: this.foodPositions,
    };
  }
}
