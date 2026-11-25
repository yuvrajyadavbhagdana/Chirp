const http = require('http');
const connectDB = require('./config/db');
const app = require('./app');
const { Server } = require('socket.io');

const start = async () => {
  await connectDB();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: app.get('allowedOrigins'), credentials: true },
  });
  io.on('connection', (socket) => {
    socket.on('join-feed', (userId) => socket.join(`user:${userId}`));
  });
  app.set('io', io);
  const port = process.env.PORT || 5000;
  server.listen(port, () => console.log(`Chirp API running on http://localhost:${port}`));
};

start().catch((error) => {
  console.error('Failed to start Chirp:', error.message);
  process.exit(1);
});
