import { CellType, Entity, getRandomNumber, Point, SharedGridState } from '@battle-snakes/shared';
import { Player } from './Player';

export class SpatialGrid {
  private size: number; // size of the grid = size x size
  private grid: Map<string, Entity>;

  constructor(size: number) {
    this.size = size;
    this.grid = new Map();
  }

  public addEntity(point: Point, entity: Entity) {
    const hash = point.toString();
    this.grid.set(hash, entity);
  }

  public addPlayer(player: Player) {
    player.segments.forEach((seg) => {
      this.addEntity(seg, { type: CellType.Snake, playerId: player.getPlayerId(), color: player.color });
    });
  }

  public clear() {
    this.grid.clear();
  }

  toSharedGridState(): SharedGridState {
    return {
      grid: Object.fromEntries(this.grid.entries()),
      size: this.size,
    };
  }

  public getRandomAvailablePosition(): Point {
    const totalPositions = this.size * this.size;
    const occupiedCount = this.grid.size;

    // If there are no available positions, return undefined. ( this is rare )
    if (occupiedCount === totalPositions) throw new Error('No available positions');

    let target = getRandomNumber(0, totalPositions - occupiedCount);

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const pos = new Point(x, y);

        if (!this.grid.has(pos.toString())) {
          if (target === 0) return pos;
          target--;
        }
      }
    }

    throw new Error('No available positions.');
  }
}
