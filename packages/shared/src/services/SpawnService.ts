import { DEFAULT_FOOD_COUNT, DEFAULT_GRID_SIZE, MAX_ROOM_SIZE } from '../constants/gameConstants';
import { Point } from '../constants/gridTypes';
import { GameState } from '../game/GameState';
import { Player } from '../player/Player';
import { getRandomNumber } from '../utils/random';

// Class that handles the spawning of entities.
export class SpawnService {
  private spawnPoints: Point[] = [];
  private spawnPointIndex = 0;

  constructor(private readonly gameState: GameState) {
    this.generateSpawnPoints();
  }

  public spawnFood() {
    while (this.gameState.getFoodPositions().size < DEFAULT_FOOD_COUNT) {
      const foodPoint = this.getRandomAvailablePosition();

      this.gameState.addFood(foodPoint);
    }
  }

  // Given the dimension of the grid, generate a list of spawn points.
  private generateSpawnPoints() {
    let spawnPositionYDelta = Math.floor(DEFAULT_GRID_SIZE / (MAX_ROOM_SIZE / 2));
    let xDelta = 5;

    for (let i = 0; i < MAX_ROOM_SIZE; i++) {
      // Alternate between left and right sides
      const shouldSpawnLeft = i % 2 === 0; // Even indices go left, odd go right
      let x = shouldSpawnLeft ? xDelta : DEFAULT_GRID_SIZE - xDelta;

      // Calculate y based on the row number (i/2 because we alternate left/right)
      const rowNumber = Math.floor(i / 2);
      let y = rowNumber * spawnPositionYDelta + Math.floor(spawnPositionYDelta * 0.75);

      this.spawnPoints.push(new Point(x, y));
    }
  }

  public spawnPlayer(player: Player) {
    const spawnPoint = this.spawnPoints[this.spawnPointIndex];

    if (spawnPoint) {
      this.spawnPointIndex++;
      player.prepareForNewRound(spawnPoint);
      if (this.spawnPointIndex % 2 === 0) {
        player.setDirection('left');
      } else {
        player.setDirection('right');
      }
    }
  }

  public spawnAllPlayers() {
    this.spawnPointIndex = 0;
    const players = this.shuffle(this.gameState.getAllPlayers());

    for (const player of players) {
      this.spawnPlayer(player);
    }
  }

  // Fisher-Yates shuffle algorithm.
  private shuffle(array: Player[]): Player[] {
    const shuffled = [...array]; // Create a copy
    let currentIndex = shuffled.length - 1;

    // While there remain elements to shuffle
    while (currentIndex > 0) {
      const randomIndex = getRandomNumber(0, currentIndex - 1);

      const temp = shuffled[currentIndex];
      shuffled[currentIndex] = shuffled[randomIndex] as Player;
      shuffled[randomIndex] = temp as Player;
      currentIndex--;
    }
    return shuffled;
  }

  public spawnInitialFood() {
    let spawnPositionYDelta = Math.floor((DEFAULT_GRID_SIZE / DEFAULT_FOOD_COUNT) * 1.1);
    let x = Math.floor(DEFAULT_GRID_SIZE / 2);
    for (let i = 0; i < DEFAULT_FOOD_COUNT; i++) {
      const y = Math.floor(i * spawnPositionYDelta) + spawnPositionYDelta;
      this.gameState.addFood(new Point(x, y));
    }
  }

  public getRandomAvailablePosition(): Point {
    const gridSize = this.gameState.getGridSize();
    const foodPositions = this.gameState.getFoodPositions();

    const totalPositions = gridSize * gridSize;
    const activePlayerCells = this.gameState.getActivePlayerCells();
    const occupiedCount = activePlayerCells.size + foodPositions.size;
    const availableCount = totalPositions - occupiedCount;

    // If there are no available positions, throw immediately.
    if (availableCount <= 0) {
      console.error(
        `Cannot find available position. Grid Size: ${gridSize}x${gridSize}=${totalPositions}, Occupied: ${occupiedCount} (Players: ${activePlayerCells.size}, Food: ${foodPositions.size})`
      );
      throw new Error('No available positions.');
    }

    // Ensure the random number generation is correct based on available spots.
    // It should be a number between 0 and availableCount - 1.
    let target = getRandomNumber(0, availableCount - 1); // Assuming getRandomNumber(min, max) is inclusive

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const pos = new Point(x, y);

        if (!activePlayerCells.has(pos.toString()) && !foodPositions.has(pos.toString())) {
          if (target === 0) return pos;
          target--;
        }
      }
    }

    // This part should theoretically be unreachable if the logic above is correct,
    // but we keep it as a safeguard.
    console.error('Failed to find position even though availableCount > 0. This indicates a logic error.');
    throw new Error('No available positions.');
  }

  public handlePlayerRemoval() {
    this.spawnPointIndex = this.gameState.getAllPlayers().length;
  }
}
