const initializeSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("disconnected", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
export default initializeSocket;