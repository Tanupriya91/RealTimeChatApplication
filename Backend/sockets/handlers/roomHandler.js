import { db } from "../../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

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
      const roomDoc = await db.collection("rooms").doc(roomId).get();

      if (!roomDoc.exists) {
        return callback({
          success: false,
          message: "Room not found",
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
      console.error("Error joining room:", error);

      return callback({
        success: false,
        message: "Failed to join room",
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
    try {
      const { roomId } = data;
      if (!roomId) {
        return callback({
          success: false,
          message: "Room ID is required",
        });
      }
      if (!socket.rooms.has(roomId)) {
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
    } catch (error) {
      console.error("Error leaving room:", error);
      return callback({
        success: false,
        message: "Failed to leave room",
      });
    }
  });

  socket.on("typing_start", (data) => {
    const { roomId } = data;

    if (!roomId || !socket.rooms.has(roomId)) {
      return;
    }

    socket.to(roomId).emit("user_typing", {
      userId: socket.data.user.uid,
      userName: socket.data.user.email || "Unknown User",
    });
  });

  socket.on("typing_stop", (data) => {
    const { roomId } = data;

    if (!roomId || !socket.rooms.has(roomId)) {
      return;
    }

    socket.to(roomId).emit("user_stopped_typing", {
      userId: socket.data.user.uid,
    });
  });

  socket.on("mark_read", async (data, callback) => {
    try {
      const { roomId, messageId } = data;

      if (!roomId || !messageId) {
        return callback({
          success: false,
          message: "Room ID and message ID are required",
        });
      }

      if (!socket.rooms.has(roomId)) {
        return callback({
          success: false,
          message: "You must join the room first",
        });
      }

      const messageRef = db
        .collection("rooms")
        .doc(roomId)
        .collection("messages")
        .doc(messageId);

      const messageDoc = await messageRef.get();

      if (!messageDoc.exists) {
        return callback({
          success: false,
          message: "Message not found",
        });
      }

      const userId = socket.data.user.uid;

      await messageRef.update({
        readBy: FieldValue.arrayUnion(userId),
      });

      io.to(roomId).emit("message_read", {
        roomId,
        messageId,
        userId,
      });

      return callback({
        success: true,
        message: "Message marked as read",
      });
    } catch (error) {
      console.error("Error marking message as read:", error);

      return callback({
        success: false,
        message: "Failed to mark message as read",
      });
    }
  });
};

export default registerRoomHandlers;
