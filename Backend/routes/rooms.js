import express from "express";
import { db } from "../config/firebase.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection("rooms").get();

    const rooms = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
    });
  }
});

router.get("/:roomId/messages", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const snapshot = await db
      .collection("rooms")
      .doc(roomId)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .limit(20)
      .get();

    const message = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
});

export default router;
