import express from "express";
import { db } from "../config/firebase.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:roomId/messages", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    const pageLimit = Math.min(
      Math.max(parseInt(req.query.limit) || 20, 1),
      50
    );

    const { cursor } = req.query;

    const messagesRef = db
      .collection("rooms")
      .doc(roomId)
      .collection("messages");

    let query = messagesRef
      .orderBy("timestamp", "desc")
      .limit(pageLimit + 1);

    if (cursor) {
      const cursorDoc = await messagesRef.doc(cursor).get();

      if (!cursorDoc.exists) {
        return res.status(400).json({
          success: false,
          message: "Invalid cursor",
        });
      }

      query = query.startAfter(cursorDoc);
    }

    const snapshot = await query.get();

    const hasMore = snapshot.docs.length > pageLimit;

    const messageDocs = hasMore
      ? snapshot.docs.slice(0, pageLimit)
      : snapshot.docs;

    const messages = messageDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastDocument = messageDocs[messageDocs.length - 1];

    const nextCursor =
      hasMore && lastDocument
        ? lastDocument.id
        : null;

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
      hasMore,
      nextCursor,
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
