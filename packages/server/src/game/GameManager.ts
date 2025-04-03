import { MAX_ROOM_SIZE, TICK_RATE_MS } from '../config/gameConfig';
import { GameLogic } from './GameLogic';
import { NetworkManager } from './NetworkManager';

export class GameManager {
  private tickInterval: NodeJS.Timer | null = null;
  private gameLogic: GameLogic;
  private roomId: string;

  constructor(roomId: string) {
    this.gameLogic = new GameLogic(roomId);
    this.roomId = roomId;

    this.start();
  }

  public start() {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => {
      this.tick();
    }, TICK_RATE_MS);
  }

  tryToAddPlayerToRoom(playerId: string) {
    if (!this.gameLogic.hasVacancy()) {
      return false;
    }

    this.gameLogic.spawnPlayer(playerId);
    return true;
  }

  removePlayerFromRoom(playerId: string) {
    this.gameLogic.removePlayer(playerId);
  }

  public tick() {
    this.gameLogic.tick();

    NetworkManager.getInstance().broadcastGameState(this.roomId, this.gameLogic.getSharedGameState());
  }

  public stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval as NodeJS.Timeout);
      this.tickInterval = null;
    }
  }

  public hasVacancy() {
    return this.gameLogic.hasVacancy();
  }

  public getRoomId() {
    return this.roomId;
  }
}
