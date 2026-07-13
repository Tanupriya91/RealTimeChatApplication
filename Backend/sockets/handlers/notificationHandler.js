import { db } from "../../config/firebase.js";
import { getUserSockets } from "../presence.js";

const registerNotificationHandlers = (io, socket) => {
  socket.on("send_notification", async (data, callback) => {
    try {
      const { receiverId, type, message } = data;

      if (!receiverId || !type || !message?.trim()) {
        return callback({
          success: false,
          message: "Receiver ID, type, and message are required",
        });
      }

      const notificationData = {
        receiverId,
        senderId: socket.data.user.uid,
        type,
        message: message.trim(),
        isRead: false,
        createdAt: new Date(),
      };

      // Save notification in Firestore
      const notificationRef = await db
        .collection("notifications")
        .add(notificationData);

      const newNotification = {
        id: notificationRef.id,
        ...notificationData,
      };

      // Get all active sockets/tabs of the receiver
      const receiverSockets = getUserSockets(receiverId);

      // Send notification to every active socket of receiver
      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit(
          "new_notification",
          newNotification,
        );
      });

      return callback({
        success: true,
        message: "Notification sent successfully",
        data: newNotification,
      });
    } catch (error) {
      console.error("Error sending notification:", error);

      return callback({
        success: false,
        message: "Failed to send notification",
      });
    }
  });
};

export default registerNotificationHandlers;