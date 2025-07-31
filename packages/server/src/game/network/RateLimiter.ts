interface RateLimitConfig {
  maxActions: number;
  windowMS: number;
  onLimitExceeded: (key: string) => void;

  shouldApplyCooldown?: boolean; // Should we apply cooldowns to certain actions if the limit is exceeded...
}

interface ActionRecord {
  timestamps: number[]; // Array of timestamps of actions...
  lastCleanup: number; // Last time the record was cleaned up...
}

export class RateLimiter {
  private records: Map<string, ActionRecord> = new Map();
  private cooldownMap: Map<string, number> = new Map();
  private readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Attempts to perform an action for a given key
   * @param key The identifier for the rate limit (e.g., IP address, user ID)
   * @returns boolean indicating if the action is allowed
   */
  public tryAction(key: string): boolean {
    if (this.config.shouldApplyCooldown && !this.canPerformAction(key)) {
      return false;
    }


    const now = Date.now();
    let record = this.records.get(key);

    if (!record) {
      record = {
        timestamps: [],
        lastCleanup: now,
      };
      this.records.set(key, record);
    }

    // Clean up old timestamps if enough time has passed since last cleanup.
    if (now - record.lastCleanup > this.config.windowMS) {
      this.cleanupOldTimestamps(key, now);
    }

    // Check if we're under the limit
    if (record.timestamps.length >= this.config.maxActions) {
      if (this.config.onLimitExceeded) {
        this.config.onLimitExceeded(key);
      }
      return false;
    }

    // Add new timestamp and allow the action.
    record.timestamps.push(now);
    return true;
  }

  // Cleans up old timestamps for a given key.
  private cleanupOldTimestamps(key: string, now: number) {
    const record = this.records.get(key);
    if (!record) return;

    // Remove timestamps that are older than the window.
    record.timestamps = record.timestamps.filter((timestamp) => now - timestamp < this.config.windowMS);
    record.lastCleanup = now;
  }

  private canPerformAction(key: string) {
    if (!this.cooldownMap) return false;
    const now = Date.now();
    const cooldownEndtime = this.cooldownMap.get(key);

    if (cooldownEndtime && now < cooldownEndtime) return false;
    else return true;
  }

  /**
   * Resets the rate limiter for a given key.
   *
   **/
  public reset(key: string) {
    this.records.delete(key);
  }

  public resetAll() {
    this.records.clear();
  }
}
