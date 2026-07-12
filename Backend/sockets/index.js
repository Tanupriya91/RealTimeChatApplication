const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.id}`);
      console.log(`Reason: ${reason}`);
    });
  });
};

export default initializeSocket;