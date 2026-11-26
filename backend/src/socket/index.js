const { Server } = require('socket.io');
const socketAuth = require('./socketAuth');
const chatHandler = require('./chatHandler');
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
    console.log(`[Socket Connected]: ${socket.user.name} (${socket.id})`);

    await User.findByIdAndUpdate(socket.user._id, { isOnline: true });
    io.emit('user_status_change', { userId: socket.user._id, isOnline: true });

    chatHandler(io, socket);
  });

  return io;
};

module.exports = initializeSocket;