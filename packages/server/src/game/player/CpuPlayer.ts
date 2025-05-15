import { CellType, Direction, Entity, getRandomNumber, Point } from '@battle-snakes/shared';
import { Player, PlayerConfigOptions } from './Player';
import { GameState } from '../core/GameState';
import { PathFinder } from './PathFinder';

export class CpuPlayer extends Player {
  gridDimensions: number = 40;
  gridState: Map<string, Entity> = new Map();
  foodPositions: Set<string> = new Set();
  private pathFinder: PathFinder;

  constructor(id: string, options: PlayerConfigOptions) {
    super(id, options);
    this.pathFinder = new PathFinder();
  }

  public chooseNextMove(gameState: GameState) {
    if (!this.gridState) return;

    const nextMove = this.pathFinder.getNextMove(gameState, this.getHead());

    // Fallback to random move if no path found
    this.setDirection(nextMove);
  }
}
