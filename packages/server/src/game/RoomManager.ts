import { GameManager } from './GameManager';

export class RoomManager {
  private static instance: RoomManager;
  private rooms: Map<string, GameManager>;

  private constructor() {
    this.rooms = new Map();
  }

  // Go through the available rooms and find the first one with a vacant spot and fill it.
  public assignPlayerToRoom(playerId: string): string {
    console.log('Trying to add clientId to a room.', playerId);

    for (const [roomId, gameManager] of this.rooms) {
      if (gameManager.hasVacancy() && gameManager.tryToAddPlayerToRoom(playerId)) {
        console.log('Room with vacancy was found for clientId', playerId, ` in room: ${roomId}`);
        return roomId;
      }
    }
    console.log('No empty rooms, making a new one...');
    // If there are no rooms, then create a new one and return it's id..
    const roomId = crypto.randomUUID();
    const theRoom = new GameManager(roomId);
    theRoom.tryToAddPlayerToRoom(playerId); // add player before setting adding room to the map..

    this.rooms.set(roomId, theRoom);

    return roomId;
  }

  public removePlayerFromRoom(roomId: string, playerId: string) {
    const theRoom = this.rooms.get(roomId);
    if (!theRoom) {
      throw new Error(`Room ${roomId} doesn't exist!`);
    }
    theRoom.removePlayerFromRoom(playerId);
  }

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }

    return RoomManager.instance;
  }

  // Remove empty rooms, manage room lifecycle.
  cleanup() {}
}
