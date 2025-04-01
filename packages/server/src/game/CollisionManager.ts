import { Collision, Point } from '@battle-snakes/shared';
import { GameState } from './GameState';

export class CollisionManager {
  public detectCollisions(gameState: GameState): Collision[] {
    const players = gameState.getPlayers();

    const collisions: Collision[] = [];

    for (const [playerId, player] of players) {
      if (!player.isActive()) continue;

      const head = player.getHead();

      // Check wall collisions
      if (this.isOutOfBounds(head, gameState.gridSize)) {
        collisions.push({
          type: 'wall',
          playerId,
        });
        continue;
      }

      // Check self collision.
      if (player.segments.length > 1) {
        // Create a temporary set without the head position
        const bodySegments = new Set(player.segments.slice(1).map((p) => p.toString()));
        if (bodySegments.has(head.toString())) {
          collisions.push({
            type: 'snake',
            playerId,
          });
          continue;
        }
      }

      // Check collisions with other players
      for (const [otherPlayerId, otherPlayer] of players) {
        // Skip if checking against self or if other player is not active
        if (playerId === otherPlayerId || !otherPlayer.isActive()) continue;

        // Check if current player's head intersects with any segment of the other player
        if (otherPlayer.segmentSet.has(head.toString())) {
          collisions.push({
            type: 'snake',
            playerId,
            otherPlayerId,
          });
          break;
        }
      }

      // Check food collision
      if (gameState.foodPositions.has(head.toString())) {
        collisions.push({
          type: 'food',
          playerId,
        });
      }
    }

    return collisions;
  }

  private isOutOfBounds(point: Point, gridSize: number): boolean {
    const { x, y } = point;

    const isXOutOfBounds = x < 0 || x >= gridSize;
    const isYOutOfBounds = y < 0 || y >= gridSize;

    return isXOutOfBounds || isYOutOfBounds;
  }
}
