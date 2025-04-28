import { PlayerData } from '@battle-snakes/shared';

// Singleton class for managing the leaderboard.
export class LeaderBoardService {
  private static instance: LeaderBoardService;
  private players: PlayerData[] = [];
  private listeners: ((actions: PlayerData[]) => void)[] = [];

  private constructor() {}

  public static getInstance(): LeaderBoardService {
    if (!LeaderBoardService.instance) {
      LeaderBoardService.instance = new LeaderBoardService();
    }
    return LeaderBoardService.instance;
  }

  public addListener(listener: (actions: PlayerData[]) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (actions: PlayerData[]) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public updatePlayers(players: PlayerData[]) {
    this.players = players.sort((a, b) => b.score - a.score);
    this.notifyListeners();
  }

  public getPlayers(): PlayerData[] {
    return this.players;
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.players));
  }
}
