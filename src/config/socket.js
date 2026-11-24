import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                // Permitir cualquier origen en Socket.IO (web local, móvil, LAN)
                callback(null, true);
            },
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO no ha sido inicializado.");
    }

    return io;
};
