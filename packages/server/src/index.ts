import { GameEventBus } from './game/events/GameEventBus';
import { NetworkService } from './game/network/NetworkService';
import { RoomService } from './game/services/RoomService';

const gameEventBus = new GameEventBus();
const roomService = new RoomService(gameEventBus);
const networkService = new NetworkService(roomService, gameEventBus);

networkService.initialize();
