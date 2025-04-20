// packages/server/src/game/core/GameState.ts
import { CellType, Entity, getRandomColor, getRandomNumber, Point, RoundState, SharedGameState } from '@battle-snakes/shared';
import { Player } from '../domain/Player';
import { DEFAULT_FOOD_COUNT, INTERMISSION_DURATION_MS, MAX_ROOM_SIZE } from '../../config/gameConfig';
import { CpuPlayer } from '../domain/CpuPlayer';

export class GameState {
  private readonly gridSize: number;
  private readonly grid: Map<string, Entity>;
  private readonly players: Map<string, Player>;
  private readonly foodPositions: Set<string>;

  private roundState: RoundState;
  private roundNumber: number = 1;
  private roundIntermissionEndTime: number | null = null;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
    this.grid = new Map();
    this.players = new Map();
    this.foodPositions = new Set();
    this.roundState = RoundState.WAITING;
  }

  public getRoundState(): RoundState {
    return this.roundState;
  }

  public setRoundState(roundState: RoundState) {
    this.roundState = roundState;
  }

  public getGrid() {
    return this.grid;
  }

  public getGridSize(): number {
    return this.gridSize;
  }

  public getPlayer(id: string): Player | undefined {
    return this.players.get(id);
  }

  public getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  public getActivePlayers(): Player[] {
    return Array.from(this.players.values()).filter((player) => player.isActive());
  }

  public getPlayerData() {
    return Array.from(this.players.values()).map((p) => p.toPlayerData());
  }

  public getFoodPositions(): Set<string> {
    // return Array.from(this.foodPositions).map((pos) => Point.parseString(pos));
    return this.foodPositions;
  }

  public isPositionOccupied(point: Point): boolean {
    return this.grid.has(point.toString());
  }

  public hasVacancy(): boolean {
    return this.players.size < MAX_ROOM_SIZE;
  }

  public isWaitTimeOver(): boolean {
    return this.roundIntermissionEndTime !== null && this.roundIntermissionEndTime < Date.now();
  }

  public areAllPlayersDead(): boolean {
    return this.getActivePlayers().length === 0;
  }

  // State Mutation Methods
  public addPlayer(playerId: string, playerName: string, playerColor: string, isCpu = false): void {
    // Set the player to alive if the round is waiting or in intermission.
    const isAlive = this.roundState === RoundState.INTERMISSION || this.roundState === RoundState.WAITING;
    this.players.set(
      playerId,
      isCpu
        ? new CpuPlayer(playerId, {
            color: getRandomColor(),
            startPosition: this.getRandomAvailablePosition(),
            isAlive,
            name: playerId,
          })
        : new Player(playerId, {
            color: playerColor || getRandomColor(),
            startPosition: this.getRandomAvailablePosition(),
            isAlive,
            name: playerName,
          })
    );
  }

  public removePlayer(playerId: string): void {
    this.players.delete(playerId);
  }

  public addFood(point: Point): void {
    this.foodPositions.add(point.toString());
  }

  public removeFood(point: Point): void {
    this.foodPositions.delete(point.toString());
  }

  public killPlayer(playerId: string) {
    this.players.get(playerId)?.kill();
  }

  public growPlayer(playerId: string) {
    this.players.get(playerId)?.grow();
  }

  // Grid Update Method
  public updateGrid(): void {
    this.grid.clear();

    // Add active players to grid
    for (const player of this.players.values()) {
      if (!player.isActive()) continue;

      player.getSegments().forEach((segment) => {
        this.grid.set(segment.toString(), {
          type: CellType.Snake,
          playerId: player.getPlayerId(),
          color: player.getColor(),
        });
      });
    }

    // Add food to grid
    for (const food of this.foodPositions) {
      this.grid.set(food, { type: CellType.Food });
    }
  }

  // Return an map of points => playerId's.
  public getActivePlayerCells(): Map<string, string> {
    const toRet = new Map<string, string>();

    for (const player of this.getActivePlayers()) {
      for (const segment of player.segments) {
        toRet.set(segment.toString(), player.getPlayerId());
      }
    }

    return toRet;
  }

  // Initialize the round:
  // - Set the round state to active.
  // - reset intermission end time.
  // - reset players to active and then set their spawn positions.
  public beginRound() {
    console.log(`Round ${this.roundNumber} beginning for room`);
    this.roundState = RoundState.ACTIVE;
    this.roundIntermissionEndTime = null;

    // Initialize players for the round
    for (const player of this.players.values()) {
      player.resetForRound(this.getRandomAvailablePosition());
    }
  }

  public beginIntermission() {
    console.log(`Round ${this.roundNumber} over for room, beginning intermission.`);

    this.roundState = RoundState.INTERMISSION;
    this.roundIntermissionEndTime = Date.now() + INTERMISSION_DURATION_MS;
    this.roundNumber++;
  }

  public isIntermissionOver(): boolean {
    return this.roundIntermissionEndTime !== null && this.roundIntermissionEndTime < Date.now();
  }

  public placeFood() {
    while (this.getFoodPositions().size < DEFAULT_FOOD_COUNT) {
      const foodPoint = this.getRandomAvailablePosition();

      this.addFood(foodPoint);
    }
  }

  // Maybe extract this to random.ts and pass in the game state variable.
  public getRandomAvailablePosition(): Point {
    // const { gridSize, players, foodPositions } = this.gameState;
    const gridSize = this.getGridSize();
    const foodPositions = this.getFoodPositions();

    const totalPositions = gridSize * gridSize;
    const activePlayerCells = this.getActivePlayerCells();
    const occupiedCount = activePlayerCells.size + foodPositions.size;

    // If there are no available positions, return undefined. ( this is rare )
    if (occupiedCount === totalPositions) {
      console.error('Occupied Counts: ', occupiedCount, ' and total:', totalPositions);
    }

    let target = getRandomNumber(0, totalPositions - occupiedCount);

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const pos = new Point(x, y);

        if (!activePlayerCells.has(pos.toString()) && !foodPositions.has(pos.toString())) {
          if (target === 0) return pos;
          target--;
        }
      }
    }

    throw new Error('No available positions.');
  }

  // Serialization for network
  public toSharedGameState(): SharedGameState {
    return {
      grid: Object.fromEntries(this.grid.entries()),
      gridSize: this.gridSize,
      players: this.getAllPlayers().map((p) => p.toPlayerData()),
      roundInfo: {
        roundState: this.roundState,
        roundIntermissionEndTime: this.roundIntermissionEndTime,
        roundNumber: this.roundNumber,
      },
    };
  }
}
