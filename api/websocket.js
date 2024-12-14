const { Server } = require('socket.io');
const { createServer } = require('http');

module.exports = (req, res) => {
  if (!res.socket.server.io) {
    const httpServer = createServer((req, res) => res.end());
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });

    io.on('connection', (socket) => {
      console.log('Nieuwe gebruiker verbonden:', socket.id);

      socket.on('createRoom', ({ roomId }) => {
        socket.join(roomId);
        socket.emit('roomCreated', roomId);
        console.log(`Room aangemaakt: ${roomId}`);
      });

      socket.on('joinRoom', ({ roomId }) => {
        socket.join(roomId);
        io.to(roomId).emit('message', `${socket.id} heeft de kamer gejoined.`);
        console.log(`${socket.id} joined room: ${roomId}`);
      });

      socket.on('message', ({ roomId, message }) => {
        io.to(roomId).emit('message', message);
      });

      socket.on('disconnect', () => {
        console.log('Gebruiker ontkoppeld:', socket.id);
      });
    });

    res.socket.server.io = io;
    httpServer.listen(0, () => console.log('WebSocket-server gestart'));
  }

  res.end();
};