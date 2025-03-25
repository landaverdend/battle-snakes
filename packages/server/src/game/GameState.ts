import { CellType, GridState, Point, getRandomPosition } from '@battle-snakes/shared';
import { Player } from './Player';

export default class GameState {
  private gridState: GridState;
  private players: Map<String, Player>;

  private tickRate: number = 100; // ms between moves.
  private tickInterval: NodeJS.Timer | null = null;

  constructor(width: number, height: number) {
    let cells = [];

    for (let i = 0; i < width; i++) {
      cells.push(new Array(height).fill({ type: CellType.Empty }));
    }

    this.gridState = {
      width: width,
      height: height,
      cells: cells,
    };

    this.players = new Map();
  }

  startGameLoop() {
    this.tickInterval = setInterval(() => {
      this.update();
    }, this.tickRate);
  }

  update() {
    for (const [_, player] of this.players) {
      this.movePlayer(player);
    }
  }

  movePlayer(player: Player) {
    const head = player.segments[0] as Point;
    const newHead = { ...head };

    switch (player.direction) {
      case 'up':
        newHead.y--;
        break;
      case 'down':
        newHead.y++;
        break;
      case 'left':
        newHead.x--;
        break;
      case 'right':
        newHead.x++;
        break;
    }

    player.segments.unshift(newHead);
    player.segments.pop();
  }

  public getGridState(): GridState {
    return this.gridState;
  }

  public getPlayers(): Map<String, Player> {
    return this.players;
  }

  public addPlayer(socketId: string) {
    const { width, height } = this.getGridState();
    this.players.set(socketId, new Player(socketId, { startPosition: getRandomPosition(width, height) }));
  }

  public removePlayer(socketId: string) {
    this.players.delete(socketId);
  }

  public getTickRate() {
    return this.tickRate;
  }

  public serialize() {
    return {
      gridState: this.gridState,
      players: Object.fromEntries(this.players),
    };
  }
}
