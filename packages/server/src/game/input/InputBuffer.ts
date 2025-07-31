import { Direction, GameEvents, getCurrentTimeISOString } from '@battle-snakes/shared';
import { GameEventBus } from '../events/GameEventBus';
import { InputValidator } from './InputValidator';
import { RateLimiter } from '../network/RateLimiter';

export interface PlayerInput {
  playerId: string;
  direction: Direction;
  timestamp: number;
}

export class InputBuffer {
  // The buffer is a map of roomId's to playerId's to player inputs...
  private buffer: Map<string, PlayerInput[]> = new Map<string, PlayerInput[]>();

  private inputValidator: InputValidator;
  private inputRateLimiter: RateLimiter;

  private readonly maxQueuedInputsPerPlayer = 3;

  private readonly RATE_LIMIT_WINDOW_MS = 1000;
  private readonly MAX_INPUTS_PER_WINDOW = 20;

  constructor(private readonly eventBus: GameEventBus) {
    this.inputValidator = new InputValidator();

    this.inputRateLimiter = new RateLimiter({
      maxActions: this.MAX_INPUTS_PER_WINDOW,
      windowMS: this.RATE_LIMIT_WINDOW_MS,
      onLimitExceeded: (playerId: string) => {
        this.eventBus.emit(GameEvents.INPUT_RATE_LIMIT_EXCEEDED, playerId);
      },
    });
  }

  addInput(playerId: string, direction: Direction) {
    if (!this.buffer.has(playerId)) {
      this.buffer.set(playerId, []);
    }

    if (!this.inputRateLimiter.tryAction(playerId)) {
      return;
    }

    if (!this.inputValidator.validateInput(direction)) {
      console.warn(`Invalid input for player" ${playerId} in direction: ${direction}`);
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

  clearAll() {
    this.buffer.clear();
  }
}
