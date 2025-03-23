import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameEvents, GridState } from '@battle-snakes/shared';

// TODO: Make this configurable.
const SOCKET_URL = 'http://localhost:3001';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [serverMessage, setServerMessage] = useState<string>('');
  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('serverMessage', (message: string) => {
      setServerMessage(message);
    });

    newSocket.on(GameEvents.PLAYER_JOIN, (data: string[]) => {
      console.log('Received PLAYER_JOIN event:', data);
      setPlayers([...data]);
    });

    console.log(GameEvents.STATE_UPDATE);
    newSocket.on(GameEvents.STATE_UPDATE, (data: any) => {});

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, serverMessage, players };
}
