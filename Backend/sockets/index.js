import socketAuthMiddleware from "./authMiddleware.js";
import registerRoomHandlers from "./handlers/roomHandler.js";

import {
  addUser,
  removeUser,
  getOnlineUsers,
} from "./presence.js";

const initializeSocket = (io) => {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const userId = socket.data.user.uid;

    console.log(`User connected: ${socket.id}`);
    console.log(`Firebase UID: ${userId}`);

    const connectionCount = addUser(userId, socket.id);

    if (connectionCount === 1) {
      socket.broadcast.emit("user_online", {
        userId,
      });
    }

    socket.emit("online_users", {
      users: getOnlineUsers(),
    });

    registerRoomHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.id}`);
      console.log(`Reason: ${reason}`);

      const remainingConnections = removeUser(
        userId,
        socket.id
      );

      if (remainingConnections === 0) {
        socket.broadcast.emit("user_offline", {
          userId,
        });
      }
    });
  });
};

export default initializeSocket;