import { GameEvents } from '@battle-snakes/shared';
import { Socket } from 'socket.io-client';

export class ChatService {
  private static instance: ChatService;
  private socket: Socket;

  private constructor(socket: Socket) {
    this.socket = socket;
  }

  public static getInstance(socket?: Socket): ChatService {
    if (!ChatService.instance && socket) {
      ChatService.instance = new ChatService(socket);
    }
    return ChatService.instance;
  }

  public sendMessage(message: string) {
    this.socket.emit(GameEvents.CHAT_MESSAGE, message);
  }
}
