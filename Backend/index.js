import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import authMiddleware from "./middleware/authMiddleware.js";
import roomRoutes from "./routes/rooms.js";
import initializeSocket from "./sockets/index.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/rooms", roomRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer,{
    cors: {
        origin: "*",
    },
});
initializeSocket(io);

app.get("/health", (req,res)=>{
    res.status(200).json({
        success: true,
        message: "Server is running",
    });
});

app.get("/protected", authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "You are authenticated",
        user: req.user,
    });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server running on the port ${PORT}`);
});