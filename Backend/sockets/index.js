import socketAuthMiddleware from "./authMiddleware.js";
const initializeSocket = (io) => {
    io.use(socketAuthMiddleware);
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    console.log(`Firebase UID: ${socket.data.user.uid}`);

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.id}`);
      console.log(`Reason: ${reason}`);
    });
  });
};

export default initializeSocket;