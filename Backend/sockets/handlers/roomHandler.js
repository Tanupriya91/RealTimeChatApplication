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
socket.on("send_message", async (data, callback) => {
  try {
    const { roomId, text } = data;

    if (!roomId || !text?.trim()) {
      return callback({
        success: false,
        message: "Room ID and message text are required",
      });
    }

    if (!socket.rooms.has(roomId)) {
      return callback({
        success: false,
        message: "You must join the room before sending messages",
      });
    }

    const messageData = {
      text: text.trim(),
      senderId: socket.data.user.uid,
      senderName: socket.data.user.email || "Unknown User",
      timestamp: new Date(),
    };

    const messageRef = await db
      .collection("rooms")
      .doc(roomId)
      .collection("messages")
      .add(messageData);

    const newMessage = {
      id: messageRef.id,
      ...messageData,
    };

    io.to(roomId).emit("new_message", newMessage);

    return callback({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);

    return callback({
      success: false,
      message: "Failed to send message",
    });
  }
});


socket.on("leave_room", async (data, callback) => {
    try{
        const { roomId } = data;
        if(!roomId){
            return callback({
                success: false,
                message: "Room ID is required",
            });
        }
        if(!socket.rooms.has(roomId)){
            return callback({
                success: false,
                message: "You are not in this room",
            });
        }
        await socket.leave(roomId);
        console.log(`${socket.id} left room ${roomId}`);
        return callback({
            success: true,
            message: "Room left successfully",
            roomId,
        });
    }
    catch(error){
        console.error("Error leaving room:", error);
        return callback({
            success: false,
            message: "Failed to leave room",
        });

    }
});

};

export default registerRoomHandlers;
