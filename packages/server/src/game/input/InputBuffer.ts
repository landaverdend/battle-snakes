import { Direction } from '@battle-snakes/shared';

// TODO: move me to shared package
export interface PlayerInput {
  playerId: string;
  direction: Direction;
  timestamp: number;
}

export class InputBuffer {
  // The buffer is a map of roomId's to playerId's to player inputs...
  private buffer: Map<string, PlayerInput[]>;
  private readonly maxQueuedInputsPerPlayer = 3;

  constructor() {
    this.buffer = new Map();
  }

  addInput(playerId: string, direction: Direction) {
    const now = new Date(Date.now()).toISOString();
    console.log(`${now.toString()} Adding input for player: ${playerId} in direction: ${direction.toString()}`);

    if (!this.buffer.has(playerId)) {
      this.buffer.set(playerId, []);
    }

    const playerInputs = this.buffer.get(playerId)!;

    if (playerInputs.length < this.maxQueuedInputsPerPlayer) {
      playerInputs.push({ playerId, direction, timestamp: Date.now() });
    } else {
      console.log(`Input buffer overflow for player: ${playerId}, dropping input.`);
    }
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
  }
}
