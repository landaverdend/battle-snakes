import { DEFAULT_GRID_SIZE, MAX_ROOM_SIZE, ROUNDS_PER_GAME } from '../constants/gameConstants';
import { RoundState, SharedGameState } from '../constants/gameTypes';
import { Entity, Point, CellType } from '../constants/gridTypes';
import { CpuPlayer } from '../player/cpu/CpuPlayer';
import { Player } from '../player/Player';
import { CollisionService } from '../services/CollisionService';
import { getRandomColor } from '../utils/random';

export class GameState {
  private readonly gridSize: number;
  private readonly grid: Map<string, Entity>;
  private readonly players: Map<string, Player>;
  private readonly foodPositions: Set<string>;

  private roundState: RoundState;
  private roundNumber: number = 0;
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

  public isActive(): boolean {
    return this.roundState === RoundState.ACTIVE;
  }

  public isWaiting(): boolean {
    return this.roundState === RoundState.WAITING;
  }

  public getGrid() {
    return this.grid;
  }

  public getRoundNumber() {
    return this.roundNumber;
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

  public getFoodPositionsAsPoints(): Point[] {
    return Array.from(this.foodPositions).map((pos) => Point.parseString(pos));
  }

  public getEntityAtPosition(point: Point): Entity {
    // If we're out of bounds, return a wall.
    if (CollisionService.isOutOfBounds(point, DEFAULT_GRID_SIZE)) {
      return { type: CellType.Wall };
    }

    // If the position is not in the grid, it is considered empty.
    const value = this.grid.get(point.toString());
    if (!value) {
      return { type: CellType.Empty };
    }

    return value;
  }

  // Positions that a snake can move to without dying are considered valid.
  public isValidPosition(point: Point): boolean {
    const entity = this.getEntityAtPosition(point);

    return entity.type === CellType.Empty || entity.type === CellType.Food;
  }

  public hasVacancy(): boolean {
    return this.players.size < MAX_ROOM_SIZE;
  }

  public areAllPlayersDead(): boolean {
    return this.getActivePlayers().length === 0;
  }

  public shouldRoundEnd(): boolean {
    return this.getActivePlayers().length <= 1;
  }

  public shouldGameEnd(): boolean {
    return this.roundNumber >= ROUNDS_PER_GAME;
  }

  // State Mutation Methods
  public addPlayer(playerId: string, playerName: string, playerColor: string): Player {
    // Set the player to alive if the round is waiting or in intermission.
    const isAlive = this.roundState === RoundState.WAITING;

    // TODO: add separate method for cpu players??
    const thePlayer = new Player(playerId, {
      color: playerColor || getRandomColor(),
      isAlive,
      name: playerName,
    });

    this.players.set(playerId, thePlayer);

    return thePlayer;
  }

  public addCpuPlayer(playerId: string, playerName: string, playerColor?: string) {

    const thePlayer = new CpuPlayer(playerId, {
      color: playerColor || getRandomColor(),
      isAlive: false,
      name: playerName,
    });

    this.players.set(playerId, thePlayer);

    return thePlayer;
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

  // Just return an array of players with highest score. If there is more then one then it was a tie...
  public calculateGameWinner(): Player[] {
    const players = this.getAllPlayers();

    let highestScore = Number.NEGATIVE_INFINITY;
    let currentHighestScorers: Player[] = [];

    for (const player of players) {
      if (player.score > highestScore) {
        highestScore = player.score;
        currentHighestScorers = [player];
      } else if (player.score === highestScore) {
        currentHighestScorers.push(player);
      }
    }

    return currentHighestScorers;
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

  public getPlayerDataById(playerId: string) {
    return this.getPlayer(playerId)?.toPlayerData();
  }

  // Initialize the round:
  // - Set the round state to active.
  // - reset intermission end time.
  // - reset players to active and then set their spawn positions.
  public beginRound() {
    console.log(`Round ${this.roundNumber} beginning for room`);
    this.roundState = RoundState.ACTIVE;
    this.roundIntermissionEndTime = null;
  }

  public resetGame() {
    this.roundNumber = 1;
    this.roundState = RoundState.WAITING;

    for (const player of this.players.values()) {
      player.resetForGame();
    }
    this.foodPositions.clear();
  }

  public beginWaiting() {
    this.roundState = RoundState.WAITING;
    this.roundNumber++;
    this.foodPositions.clear();
  }

  public cleanupPlayerObjects() {
    for (const player of this.players.values()) {
      player.handleEndRound();
    }
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
      timestamp: Date.now(),
    };
  }
}
