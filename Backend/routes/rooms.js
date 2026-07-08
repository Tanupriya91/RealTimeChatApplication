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

export default router;