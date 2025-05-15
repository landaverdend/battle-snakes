import { CellType, Direction, Entity, getRandomNumber, Point } from '@battle-snakes/shared';
import { Player, PlayerConfigOptions } from './Player';
import { GameState } from '../core/GameState';
import { PathFinder } from './PathFinder';

export class CpuPlayer extends Player {
  gridDimensions: number = 40;
  gridState: Map<string, Entity> = new Map();
  foodPositions: Set<string> = new Set();
  private pathFinder: PathFinder;
  private readonly LOOK_AHEAD_DISTANCE = 5;

  constructor(id: string, options: PlayerConfigOptions) {
    super(id, options);
    this.pathFinder = new PathFinder();
  }

  public updateGameState(gameState: GameState) {
    this.gridDimensions = gameState.getGridSize();
    this.gridState = gameState.getGrid();
    this.foodPositions = gameState.getFoodPositions();
  }

  public chooseNextMove() {
    if (!this.gridState) return;
    // const possibleMoves = this.getPossibleMoves();

    const nextMove = this.pathFinder.getNextMove(this.gridState, this.getHead());

    // Fallback to random move if no path found
    this.setDirection(nextMove);
  }
}
