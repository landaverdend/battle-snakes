interface CooldownConfig {
  cooldownMS: number;
}

export class CooldownManager {
  private cooldowns: Map<string, number> = new Map();

  constructor(private readonly config: CooldownConfig) {}

  public canPerformAction(key: string): boolean {
    return this.isCooldownActive(key);
  }

  public isCooldownActive(key: string): boolean {
    const now = Date.now();
    const cooldownEndtime = this.cooldowns.get(key);

    if (cooldownEndtime === undefined) return false;
    else return now < cooldownEndtime;
  }

  public addCooldown(key: string) {
    const now = Date.now();

    this.cooldowns.set(key, now + this.config.cooldownMS);
  }
}
