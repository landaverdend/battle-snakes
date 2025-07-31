import { PlayerData } from '@battle-snakes/shared';
import ObservableStateManager from './ObservableStateManager';

// Singleton class for managing the leaderboard.
export class LeaderboardObservable extends ObservableStateManager<PlayerData[]> {
  private static instance: LeaderboardObservable;

  private constructor() {
    const initialState: PlayerData[] = [];
    super(initialState);
  }

  public static getInstance(): LeaderboardObservable {
    if (!LeaderboardObservable.instance) {
      LeaderboardObservable.instance = new LeaderboardObservable();
    }
    return LeaderboardObservable.instance;
  }
}
