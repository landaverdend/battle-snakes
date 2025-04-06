import { DEFAULT_GRID_SIZE } from '../../config/gameConfig';
import { Game } from '../core/Game';
import { GameEventBus } from '../events/GameEventBus';

export class RoomService {
  private rooms: Map<string, Game>;

  constructor(private readonly gameEventBus: GameEventBus) {
    this.rooms = new Map();
    this.gameEventBus = gameEventBus;
  }

  // Go through the available rooms and find the first one with a vacant spot and fill it.
  public assignPlayerToRoom(playerId: string): string {
    console.log('Trying to add clientId to a room.', playerId);

    for (const [roomId, game] of this.rooms) {
      if (game.tryToAddPlayerToRoom(playerId)) {
        console.log('Room with vacancy was found for clientId', playerId, ` in room: ${roomId}`);
        return roomId;
      }
    }
    console.warn('No empty rooms, making a new one...');
    // If there are no rooms, then create a new one and return it's id..
    const roomId = crypto.randomUUID();
    const theRoom = new Game(roomId, DEFAULT_GRID_SIZE, this.gameEventBus);
    theRoom.start(); // start up the room...
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

  // Remove empty rooms, manage room lifecycle.
  cleanup() {}
}
