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

      if (player.hasCollided(this.gridState, this.players)) {
        collisions.push({ type: 'death', playerId: playerId });
      }
    }

    return collisions;
  }

  /**
   * TODO:
   * 1) We need to check to make sure that this food position is not already occupied by a player OR food.
   * 2)
   */
  public placeFood() {
    if (this.foodPositions.length < DEFAULT_FOOD_COUNT) {
      const newFoodPosition = getRandomPosition(this.gridState.width, this.gridState.height);

      while (!this.isSpaceOccupied(newFoodPosition)) {
        this.foodPositions.push(newFoodPosition);
      }
    }
  }

  // Run through and check if a space is occupied by:
  // 1) A player
  // 2) Food
  // 3) Future items?
  private isSpaceOccupied(position: Point): boolean {
    for (const player of this.players.values()) {
      for (const segment of player.segments) {
        if (segment.x === position.x && segment.y === position.y) {
          return true;
        }
      }
    }

    for (const foodPosition of this.foodPositions) {
      if (foodPosition.x === position.x && foodPosition.y === position.y) {
        return true;
      }
    }

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

  public serialize() {
    return {
      gridState: this.gridState,
      players: Object.fromEntries(this.players.entries()),
      foodPositions: [],
    };
  }
}
