import { db } from "../../config/firebase.js";

const registerRoomHandlers = (io, socket) => {
  socket.on("join_room", async (data, callback) => {
    try {
      const { roomId } = data;
      if (!roomId) {
        return callback({
          success: false,
          message: "Room ID is required",
        });
      }
      const roomDoc = await db
      .collection("rooms")
      .doc(roomId)
      .get();

      if(!roomDoc.exists){
        return callback({
            success:false,
            message:"Room not found",
        });
      }
      await socket.join(roomId);
      console.log(`${socket.id} joined room ${roomId}`);

      return callback({
        success: true,
        message: "Room joined successfully",
        roomId,
      });
    } catch (error) {
        console.error("Error joining room:",error);

        return callback({
            success:false,
            message:"Failed to join room",
        });
    }
  });
};

export default registerRoomHandlers;
