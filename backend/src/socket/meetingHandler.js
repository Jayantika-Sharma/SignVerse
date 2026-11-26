const Meeting = require('../models/Meeting');

const meetingHandler = (io, socket) => {
  const userId = socket.user._id.toString();
  const userName = socket.user.name;

  socket.on('join_meeting', async ({ roomCode }) => {
    socket.join(`meeting:${roomCode}`);
    socket.roomCode = roomCode;

    await Meeting.findOneAndUpdate(
      { roomCode },
      { $addToSet: { participants: { user: socket.user._id } } }
    );

    socket.to(`meeting:${roomCode}`).emit('user_joined_meeting', {
      socketId: socket.id,
      userId,
      userName,
      avatar: socket.user.avatar,
    });

    const clients = io.sockets.adapter.rooms.get(`meeting:${roomCode}`);
    const existingUsers = [];

    if (clients) {
      for (const clientId of clients) {
        if (clientId !== socket.id) {
          const clientSocket = io.sockets.sockets.get(clientId);
          if (clientSocket && clientSocket.user) {
            existingUsers.push({
              socketId: clientSocket.id,
              userId: clientSocket.user._id.toString(),
              userName: clientSocket.user.name,
              avatar: clientSocket.user.avatar,
            });
          }
        }
      }
    }

    socket.emit('current_meeting_users', existingUsers);
  });

  socket.on('meeting_offer', ({ toSocketId, offer }) => {
    io.to(toSocketId).emit('meeting_offer', {
      fromSocketId: socket.id,
      offer,
      userId,
      userName,
    });
  });

  socket.on('meeting_answer', ({ toSocketId, answer }) => {
    io.to(toSocketId).emit('meeting_answer', {
      fromSocketId: socket.id,
      answer,
    });
  });

  socket.on('ice_candidate', ({ toSocketId, candidate }) => {
    io.to(toSocketId).emit('ice_candidate', {
      fromSocketId: socket.id,
      candidate,
    });
  });

  socket.on('raise_hand', ({ roomCode, isRaised }) => {
    io.to(`meeting:${roomCode}`).emit('user_raised_hand', {
      socketId: socket.id,
      userId,
      userName,
      isRaised,
    });
  });

  socket.on('send_meeting_reaction', ({ roomCode, emoji }) => {
    io.to(`meeting:${roomCode}`).emit('meeting_reaction', {
      socketId: socket.id,
      userId,
      userName,
      emoji,
    });
  });

  socket.on('broadcast_gesture_live', ({ roomCode, gestureText, confidence, category }) => {
    io.to(`meeting:${roomCode}`).emit('live_gesture_received', {
      userId,
      userName,
      gestureText,
      confidence,
      category,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('broadcast_speech_caption', ({ roomCode, transcript, isFinal }) => {
    io.to(`meeting:${roomCode}`).emit('live_caption_received', {
      userId,
      userName,
      transcript,
      isFinal,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('leave_meeting', async ({ roomCode }) => {
    socket.leave(`meeting:${roomCode}`);
    socket.to(`meeting:${roomCode}`).emit('user_left_meeting', {
      socketId: socket.id,
      userId,
      userName,
    });
  });
};

module.exports = meetingHandler;