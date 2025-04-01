import { CellType, Collision, Point } from '@battle-snakes/shared';
import { GameState } from './GameState';

export class CollisionManager {
  public detectCollisions(gameState: GameState): Collision[] {
    const players = gameState.getPlayers();
    const grid = gameState.getGrid();

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

      // Check snake collisions
      const cellContent = grid.get(head.toString());
      if (cellContent && cellContent.type === CellType.Snake) {
        // Only add collision if playerId exists to satisfy type checking
        if (cellContent.playerId) {
          collisions.push({
            type: 'snake',
            playerId: cellContent.playerId,
            targetId: cellContent.playerId,
          });
        }
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
