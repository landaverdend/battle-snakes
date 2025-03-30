import { Entity, Point, SharedGridState } from '@battle-snakes/shared';

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

  public clear() {
    this.grid.clear();
  }

  toSharedGridState(): SharedGridState {
    return {
      grid: Object.fromEntries(this.grid.entries()),
      size: this.size,
    };
  }
}
