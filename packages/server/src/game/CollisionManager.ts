import { Collision, Point } from '@battle-snakes/shared';
import { GameState } from './GameState';
import { Player } from './Player';

export class CollisionManager {
  public detectCollisions(gameState: GameState): Collision[] {
    const players = gameState.getPlayers();

    const collisions: Collision[] = [];
    const activePlayerCells = this.collectActivePlayerCells(players);

    // Iterate through all players, check if the head has collided with any objects (or other players.)
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
            type: 'self',
            playerId,
          });
          continue;
        }
      }

      // Check collisions with other players
      const otherPlayerId = activePlayerCells.get(head.toString());
      if (typeof otherPlayerId === 'string' && otherPlayerId !== playerId) {
        collisions.push({ type: 'snake', playerId, otherPlayerId });
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

  /**
   * Collect the current player positions alongside the player location.
   */
  public collectActivePlayerCells(players: Map<string, Player>): Map<string, string> {
    const toRet = new Map<string, string>();

    for (const [playerId, player] of players) {
      if (player.isActive()) {
        for (const segment of player.segments) {
          toRet.set(segment.toString(), playerId);
        }
      }
    }

    return toRet;
  }

  private isOutOfBounds(point: Point, gridSize: number): boolean {
    const { x, y } = point;

    const isXOutOfBounds = x < 0 || x >= gridSize;
    const isYOutOfBounds = y < 0 || y >= gridSize;

    return isXOutOfBounds || isYOutOfBounds;
  }
}
