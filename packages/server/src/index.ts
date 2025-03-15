import { createServer } from 'http';
import { Server } from 'socket.io';
import { GameEvents } from '@battle-snakes/shared';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000', // Allow our Vite dev server
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send a welcome message to the connected client
  socket.emit('serverMessage', 'Hello from the Battle Snakes server! Your ID is' + socket.id);
  socket.emit(GameEvents.PLAYER_JOIN, { playerId: socket.id });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env['PORT'] || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
