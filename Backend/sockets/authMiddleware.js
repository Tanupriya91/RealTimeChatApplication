import { auth } from "../config/firebase.js";
const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if(!token){
            return next(new Error("Authentication required"));
        }
        const decodeedToken = await auth.verifyIdToken(token);
        socket.data.user = decodeedToken;
        next();

    }
    catch(error){
        next(new Error("Invalid or expired token"));

    }
};
export default socketAuthMiddleware;