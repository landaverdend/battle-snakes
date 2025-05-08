import { PlayerData } from '@battle-snakes/shared';
import ObservableStateManager from './ObservableStateManager';

// Singleton class for managing the leaderboard.
export class LeaderBoardState extends ObservableStateManager<PlayerData[]> {
  private static instance: LeaderBoardState;

  private constructor() {
    const initialState: PlayerData[] = [];
    super(initialState);
  }

  public static getInstance(): LeaderBoardState {
    if (!LeaderBoardState.instance) {
      LeaderBoardState.instance = new LeaderBoardState();
    }
    return LeaderBoardState.instance;
  }

  public override updateState(players: PlayerData[]) {
    this.state = players;
    this.notifyListeners(this.state);
  }
}
