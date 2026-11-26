const { Server } = require('socket.io');
const socketAuth = require('./socketAuth');
const chatHandler = require('./chatHandler');
const meetingHandler = require('./meetingHandler');
const User = require('../models/User');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.use(socketAuth);

  io.on('connection', async (socket) => {
    await User.findByIdAndUpdate(socket.user._id, { isOnline: true });
    io.emit('user_status_change', { userId: socket.user._id, isOnline: true });

    chatHandler(io, socket);
    meetingHandler(io, socket);

    socket.on('disconnect', () => {
      if (socket.roomCode) {
        socket.to(`meeting:${socket.roomCode}`).emit('user_left_meeting', {
          socketId: socket.id,
          userId: socket.user._id.toString(),
          userName: socket.user.name,
        });
      }
    });
  });

  return io;
};

module.exports = initializeSocket;