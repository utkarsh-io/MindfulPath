// socketServer.js
import { Server } from 'socket.io';

// Object to store mapping of userId to socket.id
const userSocketMap = {};

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for user registration
    socket.on('registerUser', (userId) => {
      userSocketMap[userId] = socket.id;
      console.log(`Registered user ${userId} with socket ${socket.id}`);
    });

    // Listen for expert starting a chat session (text chat, already implemented)
    socket.on('startChat', ({ userId, room, expert_id }) => {
      const userSocketId = userSocketMap[userId];
      if (userSocketId) {
        io.to(userSocketId).emit("chatStarted", { room, expert_id });
        console.log(`Chat started event sent to user ${userId} (socket ${userSocketId})`);
      } else {
        console.log(`No active socket for user ${userId}`);
      }
    });

    // Video/Voice Call Signaling Events

    // When a caller (user or expert) initiates a video call
    socket.on("initiateVideoCall", ({ partnerId, signalData }) => {
      const partnerSocketId = userSocketMap[partnerId];
      if (partnerSocketId) {
        io.to(partnerSocketId).emit("videoCallInitiated", { signalData, from: socket.id });
        console.log(`Video call initiated from ${socket.id} to ${partnerSocketId}`);
      } else {
        console.log(`No active socket for partner ${partnerId}`);
      }
    });

    // When a call participant sends additional signaling data
    socket.on("videoCallSignal", ({ partnerId, signalData }) => {
      const partnerSocketId = userSocketMap[partnerId];
      if (partnerSocketId) {
        io.to(partnerSocketId).emit("videoCallSignal", { signalData, from: socket.id });
        console.log(`Video call signal from ${socket.id} forwarded to ${partnerSocketId}`);
      } else {
        console.log(`No active socket for partner ${partnerId}`);
      }
    });

    // Standard room join and chat message handling
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on('chatMessage', ({ room, message, sender }) => {
      io.to(room).emit('chatMessage', { message, sender });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Remove socket from mapping
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];
          break;
        }
      }
    });
  });

  return io;
}
