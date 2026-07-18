import { Server } from "socket.io";

let io;

export const initSocket = (server) => {

    io = new Server(server, {

        cors: {

            origin: "*",

            methods: ["GET", "POST"]

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