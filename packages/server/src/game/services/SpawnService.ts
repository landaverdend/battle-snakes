import { getRandomColor, getRandomNumber, Point } from '@battle-snakes/shared';
import { DEFAULT_FOOD_COUNT, DEFAULT_GRID_SIZE, MAX_ROOM_SIZE } from '../../config/gameConfig';
import { GameState } from '../core/GameState';
import { Player } from '../domain/Player';

// Class that handles the spawning of entities.
export class SpawnService {
  constructor(private readonly gameState: GameState) {}

  public spawnFood() {
    while (this.gameState.getFoodPositions().size < DEFAULT_FOOD_COUNT) {
      const foodPoint = this.getRandomAvailablePosition();

      this.gameState.addFood(foodPoint);
    }
  }

  public spawnPlayers() {
    let spawnPositionYDelta = Math.floor(DEFAULT_GRID_SIZE / (MAX_ROOM_SIZE / 2));
    let xDelta = 5;
    const players = this.gameState.getAllPlayers();

    for (let i = 0; i < players.length; i++) {
      const shouldSpawnLeft = i < MAX_ROOM_SIZE / 2;
      let x = shouldSpawnLeft ? xDelta : DEFAULT_GRID_SIZE - xDelta;
      let y = (i % 5) * spawnPositionYDelta + Math.floor(spawnPositionYDelta * 0.75);

      const player = players[i] as Player;
      player?.prepareForNewRound(new Point(x, y));
      if (shouldSpawnLeft) {
        player.setDirection('right');
      } else {
        player.setDirection('left');
      }
    }
  }

  public spawnInitialFood() {
    let spawnPositionYDelta = Math.floor((DEFAULT_GRID_SIZE / DEFAULT_FOOD_COUNT) * 0.9);
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

  addCpuPlayers(num: number) {
    for (let i = 0; i < num; i++) {
      this.gameState.addPlayer(`CPU ${i + 1}`, `CPU ${i + 1}`, getRandomColor(), true);
    }
  }
}
