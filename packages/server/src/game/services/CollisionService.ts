import { Collision, Message, Point } from '@battle-snakes/shared';
import { GameState } from '../core/GameState';

export class CollisionService {
  public static detectCollisions(gameState: GameState): Collision[] {
    const players = gameState.getActivePlayers();

    const collisions: Collision[] = [];

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
      let snakeCollisionDetected = false;
      for (const otherPlayer of players) {
        // Skip checking against self
        if (otherPlayer.getPlayerId() === playerId) {
          continue;
        }

        // Check if the current player's head overlaps with any segment of the other player
        const otherPlayerSegmentSet = otherPlayer.getSegmentSet();
        if (otherPlayerSegmentSet.has(head.toString())) {
          collisions.push({
            type: 'snake',
            point: head,
            playerId,
            otherPlayerId: otherPlayer.getPlayerId(),
          });
          snakeCollisionDetected = true;
          break; // Found a collision with another snake, no need to check more snakes for this player
        }
      }

      if (snakeCollisionDetected) {
        continue;
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

  public static convertCollisionsToMessages(collisions: Collision[]): Message[] {
    const messages: Message[] = [];

    for (const collision of collisions) {
      let str = '';
      switch (collision.type) {
        case 'wall':
          str = `${collision.playerId} hit the wall.`;
          break;
        case 'snake':
          str = `${collision.playerId} hit ${collision.otherPlayerId}.`;
          break;
        case 'self':
          str = `${collision.playerId} hit themselves.`;
          break;
        case 'food':
          continue;
      }

      messages.push({ type: 'collision', message: str });
    }

    return messages;
  }
}
