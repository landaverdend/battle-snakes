import { Collision, GameMessage } from '../constants/gameTypes';
import { Point } from '../constants/gridTypes';
import { GameState } from '../game/GameState';

export class CollisionService {
  public static detectCollisions(gameState: GameState): Collision[] {
    const players = gameState.getActivePlayers();

    const collisions: Collision[] = [];

    // Iterate through all players, check if the head has collided with any objects (or other players.)
    for (const player of players) {
      const head = player.getHead();
      const playerId = player.getPlayerId();
      const playerData = player.toPlayerData();

      // Check food collision
      if (gameState.getFoodPositions().has(head.toString())) {
        collisions.push({
          point: head,
          type: 'food',
          playerData: playerData,
          playerId,
        });
      }

      // Check wall collisions
      if (this.isOutOfBounds(head, gameState.getGridSize())) {
        collisions.push({
          type: 'wall',
          playerId,
          playerData: player.toPlayerData(),
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
            playerData: playerData,
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
            playerData: playerData,
            otherPlayerData: otherPlayer.toPlayerData(),
            isHeadOnCollision: player.getHead().equals(otherPlayer.getHead()),
          });
          snakeCollisionDetected = true;
          break; // Found a collision with another snake, no need to check more snakes for this player
        }
      }

      if (snakeCollisionDetected) {
        continue;
      }
    }

    return collisions;
  }

  public static isOutOfBounds(point: Point, gridSize: number): boolean {
    const { x, y } = point;

    const isXOutOfBounds = x < 0 || x >= gridSize;
    const isYOutOfBounds = y < 0 || y >= gridSize;

    return isXOutOfBounds || isYOutOfBounds;
  }

  public static convertCollisionsToMessages(collisions: Collision[]): GameMessage[] {
    const messages: GameMessage[] = [];
    const headOnCollisions = new Set<string>();

    for (const collision of collisions) {
      let str = '';
      switch (collision.type) {
        case 'wall':
          str = `{playerName} hit the wall.`;
          break;
        case 'snake':
          if (collision.isHeadOnCollision) {
            // Create a unique key for this head-on collision
            const collisionKey = [collision.playerId, collision.otherPlayerId].sort().join('-');

            // Skip if we've already processed this head-on collision
            if (headOnCollisions.has(collisionKey)) {
              continue;
            }

            str = `{playerName} and {otherPlayerName} collided head on.`;
            headOnCollisions.add(collisionKey);
          } else {
            str = `{playerName} hit {otherPlayerName}.`;
          }
          break;
        case 'self':
          str = `{playerName} hit themselves.`;
          break;
        case 'food':
          continue;
      }

      messages.push({
        type: 'player',
        message: str,
        playerData: collision.playerData,
        otherPlayerData: collision.otherPlayerData,
      });
    }

    return messages;
  }
}
