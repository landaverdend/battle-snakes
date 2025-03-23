import { createServer } from 'http';
import { Server } from 'socket.io';
import { GameEvents } from '@battle-snakes/shared';
import GameState from './game/GameState';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000', // Allow our Vite dev server
    methods: ['GET', 'POST'],
  },
});

const gameState = new GameState(10, 10);

io.on('connection', (socket) => {
  socket.emit('serverMessage', 'Welcome ' + socket.id + '! You are connected to the server!');
  gameState.addPlayer(socket.id);

  io.emit(GameEvents.STATE_UPDATE, gameState.serialize());

  socket.on('disconnect', () => {
    console.log('Client disconnected: ', socket.id);

    gameState.removePlayer(socket.id);
    io.emit(GameEvents.PLAYER_JOIN, Array.from(gameState.getPlayers().keys()));
  });
});

const PORT = process.env['PORT'] || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
