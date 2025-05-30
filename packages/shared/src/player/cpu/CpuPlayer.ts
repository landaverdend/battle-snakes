import { DEFAULT_GRID_SIZE } from '../../constants/gameConstants';
import { Entity } from '../../constants/gridTypes';
import { GameState } from '../../game/GameState';
import { Player, PlayerConfigOptions } from '../Player';
import { PathFindingStrategy } from './pathfinding/PathFindingStrategy';

export class CpuPlayer extends Player {
  gridDimensions: number = DEFAULT_GRID_SIZE;
  gridState: Map<string, Entity> = new Map();
  foodPositions: Set<string> = new Set();
  private pathFinder: PathFindingStrategy;

  constructor(id: string, options: PlayerConfigOptions) {
    super(id, options);
    this.pathFinder = new PathFindingStrategy(id);
  }

  public chooseNextMove(gameState: GameState) {
    const nextMove = this.pathFinder.getNextMove(gameState, this.getHead());
    this.setDirection(nextMove);
  }

  public override handleEndRound() {
    this.pathFinder.clearData();
  }
}
