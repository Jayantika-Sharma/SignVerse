const Message = require('../models/Message');
const User = require('../models/User');

const chatHandler = (io, socket) => {
  const userId = socket.user._id.toString();

  socket.on('join_channel', (channelId) => {
    socket.join(`channel:${channelId}`);
    console.log(`[Socket] User ${socket.user.name} (${userId}) joined channel:${channelId}`);
  });

  socket.on('leave_channel', (channelId) => {
    socket.leave(`channel:${channelId}`);
    console.log(`[Socket] User ${socket.user.name} left channel:${channelId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { channelId, content, messageType, gestureMetadata, attachments } = data;

      if (!channelId || !content) return;

      const newMessage = await Message.create({
        channel: channelId,
        sender: socket.user._id,
        content,
        messageType: messageType || 'standard',
        gestureMetadata: gestureMetadata || {},
        attachments: attachments || [],
      });

      const populatedMessage = await newMessage.populate(
        'sender',
        'name email avatar outputPreference'
      );

      io.to(`channel:${channelId}`).emit('new_message', populatedMessage);
    } catch (error) {
      socket.emit('socket_error', { message: 'Failed to send message', details: error.message });
    }
  });

  socket.on('typing_start', ({ channelId, action = 'typing' }) => {
    socket.to(`channel:${channelId}`).emit('user_typing', {
      userId,
      name: socket.user.name,
      action, 
      channelId,
    });
  });

  socket.on('typing_stop', ({ channelId }) => {
    socket.to(`channel:${channelId}`).emit('user_stop_typing', {
      userId,
      channelId,
    });
  });

  socket.on('disconnect', async () => {
    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
      io.emit('user_status_change', { userId, isOnline: false });
      console.log(`[Socket] User disconnected: ${socket.user.name}`);
    } catch (err) {
      console.error('[Socket Disconnect Error]:', err.message);
    }
  });
};

module.exports = chatHandler;