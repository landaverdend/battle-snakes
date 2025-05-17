import { Entity } from '@battle-snakes/shared';
import { Player, PlayerConfigOptions } from './Player';
import { GameState } from '../core/GameState';
import { PathFindingStrategy } from './PathfindingStrategy';

export class CpuPlayer extends Player {
  gridDimensions: number = 40;
  gridState: Map<string, Entity> = new Map();
  foodPositions: Set<string> = new Set();
  private pathFinder: PathFindingStrategy;

  constructor(id: string, options: PlayerConfigOptions) {
    super(id, options);
    this.pathFinder = new PathFindingStrategy();
  }

  public chooseNextMove(gameState: GameState) {
    if (!this.gridState) return;

    const nextMove = this.pathFinder.getNextMove(gameState, this.getHead());
    this.setDirection(nextMove);
  }

  public override handleEndRound() {
    this.pathFinder.clearData();
  }
}
