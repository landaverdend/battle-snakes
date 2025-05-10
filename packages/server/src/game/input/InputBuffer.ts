import { Direction, GameEvents, getCurrentTimeISOString } from '@battle-snakes/shared';
import { GameEventBus } from '../events/GameEventBus';

// TODO: move me to shared package
export interface PlayerInput {
  playerId: string;
  direction: Direction;
  timestamp: number;
}

export class InputBuffer {
  // The buffer is a map of roomId's to playerId's to player inputs...
  private buffer: Map<string, PlayerInput[]> = new Map<string, PlayerInput[]>();

  // Map of playerId's to their input timestamps...
  private playerInputTimestamps: Map<string, number[]> = new Map<string, number[]>();

  private readonly maxQueuedInputsPerPlayer = 3;
  private readonly RATE_LIMIT_WINDOW_MS = 1000;
  private readonly MAX_INPUTS_PER_WINDOW = 10;
  constructor(private readonly eventBus: GameEventBus) {}

  addInput(playerId: string, direction: Direction) {
    if (!this.buffer.has(playerId)) {
      this.buffer.set(playerId, []);
    }

    if (this.checkIfExceedsRateLimit(playerId)) {
      return;
    }

    console.log(`${getCurrentTimeISOString()} Adding input for player: ${playerId} in direction: ${direction?.toString()}`);

    const playerInputs = this.buffer.get(playerId)!;

    if (playerInputs.length < this.maxQueuedInputsPerPlayer) {
      playerInputs.push({ playerId, direction, timestamp: Date.now() });
    } else {
      console.log(`Input buffer overflow for player: ${playerId}, dropping input.`);
    }
  }

  // Check if the player has inputted too many times within the rate limit window...
  private checkIfExceedsRateLimit(playerId: string) {
    // Get the current time and player's input timestamps
    const currentTime = Date.now();
    let playerInputTimestamps = this.playerInputTimestamps.get(playerId) || [];

    // Prune out timestamps that are older than the rate limit window
    playerInputTimestamps = playerInputTimestamps.filter((ts) => currentTime - ts < this.RATE_LIMIT_WINDOW_MS);
    console.log(playerInputTimestamps);

    let doesExceed = false;
    // Check if the player has inputted too many times within the rate limit window
    if (playerInputTimestamps.length >= this.MAX_INPUTS_PER_WINDOW) {
      this.eventBus.emit(GameEvents.INPUT_RATE_LIMIT_EXCEEDED, playerId);
      doesExceed = true;
    } else {
      playerInputTimestamps.push(currentTime);
      this.playerInputTimestamps.set(playerId, playerInputTimestamps);
    }

    return doesExceed;
  }

  /**
   * Processes one input per player per tick.
   * Retrieve the oldest input for each player, and remove it from the buffer.
   * @returns An array of inputs, containing at most one input per player.
   */
  processInputsForTick(): PlayerInput[] {
    // Collect all inputs for the room.
    const inputsToProcess: PlayerInput[] = [];

    for (const playerInputs of this.buffer.values()) {
      if (playerInputs.length > 0) {
        playerInputs.sort((a, b) => a.timestamp - b.timestamp);

        const oldestInput = playerInputs.shift();
        if (oldestInput) {
          inputsToProcess.push(oldestInput);
        }
      }
    }
    return inputsToProcess;
  }

  clearPlayer(playerId: string) {
    this.buffer.delete(playerId);
    this.playerInputTimestamps.delete(playerId);
  }

  clearAll() {
    this.buffer.clear();
    this.playerInputTimestamps.clear();
  }
}
