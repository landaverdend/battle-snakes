import { createServer } from 'http';
import { Server } from 'socket.io';
import { Direction, GameEvents } from '@battle-snakes/shared';
import GameState from './game/GameState';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000', // Allow our Vite dev server
    methods: ['GET', 'POST'],
  },
});

const gameState = new GameState(20, 20);
gameState.startGameLoop();

io.on('connection', (socket) => {
  gameState.addPlayer(socket.id);

  setInterval(() => {
    io.emit(GameEvents.STATE_UPDATE, gameState.serialize());
  }, gameState.getTickRate());

  socket.on(GameEvents.MOVE_REQUEST, (direction: Direction) => {
    const player = gameState.getPlayers().get(socket.id);

    if (player) {
      // Validate move (prevent 180-degree turns)
      player.direction = direction;
    }
  });

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
