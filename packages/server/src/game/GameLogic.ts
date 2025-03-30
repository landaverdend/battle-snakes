import { getRandomColor, getRandomNumber, Point, SharedGameState } from '@battle-snakes/shared';
import { DEFAULT_GRID_SIZE } from '../config/gameConfig';
import { GameState } from './GameState';
import { Player } from './Player';

export class GameLogic {
  private gameState: GameState;

  public constructor() {
    this.gameState = new GameState(DEFAULT_GRID_SIZE);
  }

  public tick() {
    this.movementTick(); // Move the players first.

    this.gameState.update();
  }

  public spawnPlayer(playerId: string) {
    const player = new Player(playerId, {
      color: getRandomColor(),
      startPosition: this.getRandomAvailablePosition(),
    });

    this.gameState.addPlayer(player);
    // TODO: add player to the spatial grid.
  }

  public removePlayer(playerId: string) {
    this.gameState.removePlayer(playerId);
    // TODO: remove player from the spatial grid.
  }

  public getSharedGameState(): SharedGameState {
    return this.gameState.getSharedGameState();
  }

  public movementTick() {
    const players = this.gameState.getPlayers();

    for (const player of players.values()) {
      player.move();
    }
  }

  public getRandomAvailablePosition(): Point {
    const { size, grid } = this.gameState.getGrid();

    const totalPositions = size * size;
    const occupiedCount = grid.size;

    // If there are no available positions, return undefined. ( this is rare )
    if (occupiedCount === totalPositions) throw new Error('No available positions');

    let target = getRandomNumber(0, totalPositions - occupiedCount);

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const pos = new Point(x, y);

        if (!grid.has(pos.toString())) {
          if (target === 0) return pos;
          target--;
        }
      }
    }

    throw new Error('No available positions.');
  }
}
