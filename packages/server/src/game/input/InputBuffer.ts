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
  private readonly maxInputsPerPlayerPerTick = 3;

  constructor() {
    this.buffer = new Map();
  }

  addInput(playerId: string, direction: Direction) {

    if (!this.buffer.has(playerId)) {
      this.buffer.set(playerId, []);
    }

    const playerInputs = this.buffer.get(playerId)!;

    if (playerInputs.length >= this.maxInputsPerPlayerPerTick) {
      console.log('input accepted');
      playerInputs.push({ playerId, direction, timestamp: Date.now() });
    } else {
      console.log('input rejected.');
    }
  }

  processBuffer(): PlayerInput[] {
    // Collect all inputs for the room.
    const allInputs: PlayerInput[] = [];
    for (const playerInputs of this.buffer.values()) {
      allInputs.push(...playerInputs);
    }

    // Clear out the room's buffer.
    this.buffer.clear();

    // Return the inputs sorted by timestamp.
    return allInputs.sort((a, b) => a.timestamp - b.timestamp);
  }

  clearRoom(roomId: string) {
    this.buffer.delete(roomId);
  }

  clearPlayer(playerId: string) {
    this.buffer.delete(playerId);
  }
}
