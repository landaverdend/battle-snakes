import { Collision, Point } from '@battle-snakes/shared';
import { GameState } from '../core/GameState';

export class CollisionService {
  public static detectCollisions(gameState: GameState): Collision[] {
    const players = gameState.getActivePlayers();

    const collisions: Collision[] = [];
    const activePlayerCells = gameState.getActivePlayerCells();

    // Iterate through all players, check if the head has collided with any objects (or other players.)
    for (const player of players) {
      const head = player.getHead();
      const playerId = player.getPlayerId();

      // Check wall collisions
      if (this.isOutOfBounds(head, gameState.getGridSize())) {
        collisions.push({
          type: 'wall',
          playerId,
          point: head,
        });
        continue;
      }

      // Check self collision.
      if (player.segments.length > 1) {
        // Create a temporary set without the head position
        const bodySegments = new Set(player.segments.slice(1).map((p) => p.toString()));
        if (bodySegments.has(head.toString())) {
          collisions.push({
            type: 'self',
            playerId,
            point: head,
          });
          continue;
        }
      }

      // Check collisions with other players
      const otherPlayerId = activePlayerCells.get(head.toString());
      if (typeof otherPlayerId === 'string' && otherPlayerId !== playerId) {
        collisions.push({ type: 'snake', point: head, playerId, otherPlayerId });
      }

      // Check food collision
      if (gameState.getFoodPositions().has(head.toString())) {
        collisions.push({
          point: head,
          type: 'food',
          playerId,
        });
      }
    }

    return collisions;
  }

  private static isOutOfBounds(point: Point, gridSize: number): boolean {
    const { x, y } = point;

    const isXOutOfBounds = x < 0 || x >= gridSize;
    const isYOutOfBounds = y < 0 || y >= gridSize;

    return isXOutOfBounds || isYOutOfBounds;
  }
}
