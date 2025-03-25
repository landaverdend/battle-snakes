import { GridState, Point, getRandomPosition } from '@battle-snakes/shared';
import { Player } from './Player';

export default class GameState {
  private gridState: GridState;
  private players: Map<string, Player>;
  private foodPositions: Point[];

  private deadPlayers: Map<string, string>;

  private tickRate: number = 100; // ms between moves.

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
      this.movePlayer(player);
    }
  }

  movePlayer(player: Player) {
    const head = player.segments[0] as Point;
    const newHead = { ...head };

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
    for (const [playerId, player] of this.players) {
      if (player.hasCollided(this.serialize())) {
        console.log('player has collided! ', playerId);

        this.removePlayer(playerId.toString());
      }
    }
  }

  public getPlayers(): Map<String, Player> {
    return this.players;
  }

  public addPlayer(socketId: string) {
    const { width, height } = this.gridState;
    this.players.set(socketId, new Player(socketId, { startPosition: getRandomPosition(width, height) }));
  }

  public addDeadPlayer(socketId: string, message: string) {
    this.deadPlayers.set(socketId, message);
  }

  public removePlayer(socketId: string) {
    this.players.delete(socketId);
  }

  public getTickRate() {
    return this.tickRate;
  }

  public serialize() {
    const snakePositions: Record<string, Point[]> = {};

    this.players.forEach((player, id) => {
      snakePositions[id.toString()] = player.segments;
    });

    return {
      gridState: this.gridState,
      players: Object.fromEntries(this.players.entries()),
      foodPositions: [],
    };
  }
}
