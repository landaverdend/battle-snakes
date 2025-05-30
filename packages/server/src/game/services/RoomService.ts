import { DEFAULT_GRID_SIZE } from '@battle-snakes/shared';
import { GameEventBus } from '../events/GameEventBus';
import { NetworkGame } from '../core/NetworkGame';

export class RoomService {
  private rooms: Map<string, NetworkGame>;

  constructor(private readonly gameEventBus: GameEventBus) {
    this.rooms = new Map();
    this.gameEventBus = gameEventBus;
  }

  // Go through the available rooms and find the first one with a vacant spot and fill it.
  public assignPlayerToRoom(playerId: string, playerName: string, playerColor: string): string {
    console.log('Trying to add clientId to a room.', playerId);

    for (const [roomId, game] of this.rooms) {
      if (game.tryToAddPlayerToLobby(playerId, playerName, playerColor)) {
        console.log('Room with vacancy was found for clientId', playerId, ` in room: ${roomId}`);
        return roomId;
      }
    }
    console.warn('No empty rooms, making a new one...');
    // If there are no rooms, then create a new one and return it's id..
    const roomId = crypto.randomUUID();
    // const theRoom = new Game(roomId, DEFAULT_GRID_SIZE, this.gameEventBus);
    const theRoom = new NetworkGame({ roomId, gridSize: DEFAULT_GRID_SIZE, gameEventBus: this.gameEventBus });

    theRoom.start(); // start up the room...
    theRoom.tryToAddPlayerToLobby(playerId, playerName, playerColor); // add player before setting adding room to the map..

    this.rooms.set(roomId, theRoom);
    return roomId;
  }

  public removePlayerFromRoom(roomId: string, playerId: string) {
    const theRoom = this.rooms.get(roomId);
    if (!theRoom) {
      throw new Error(`Room ${roomId} doesn't exist!`);
    }
    theRoom.removePlayerFromLobby(playerId);

    if (theRoom.getPlayerData().length === 0) {
      console.warn(`Room ${roomId} is empty, deleting...`);
      theRoom.stop();
      this.rooms.delete(roomId);
    }
  }

  public getGameByRoomId(roomId: string): NetworkGame | undefined {
    return this.rooms.get(roomId);
  }

  // Remove empty rooms, manage room lifecycle.
  cleanup() {
    for (const [roomId, game] of this.rooms) {
      if (game.getPlayerData().length === 0) {
        game.stop();
        this.rooms.delete(roomId);
        console.log(`Room ${roomId} is empty, deleting...`);
      }
    }
  }
}
