import { getRandomColor, PlayerData, Point } from '@battle-snakes/shared';

export type PlayerConfigOptions = {
  color?: string;
  startPosition: Point;
};
export class Player {
  private id: string;
  color: string;
  segments: Point[];
  score: number;

  constructor(id: string, config: PlayerConfigOptions) {
    this.id = id;
    this.color = config.color || getRandomColor();
    this.segments = [config.startPosition];
    this.score = 0;
  }

  public getPlayerId() {
    return this.id;
  }

  toPlayerData(): PlayerData {
    return {
      id: this.id,
      color: this.color,
      score: this.score,
    };
  }
}
