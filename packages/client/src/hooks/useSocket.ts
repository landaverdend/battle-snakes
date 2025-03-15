import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Point } from '@battle-snakes/shared';

// TODO: Make this configurable.
const SOCKET_URL = 'http://localhost:3001';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [serverMessage, setServerMessage] = useState<string>('');

  useEffect(() => {
    const newSocket = io(SOCKET_URL);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('serverMessage', (message: string) => {
      setServerMessage(message);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, serverMessage };
}
